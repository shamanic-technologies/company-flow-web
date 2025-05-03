import { NextResponse, NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  getAuthToken,
  callApiService, // Using this generic function to call via API Gateway
  handleApiError
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { ServiceResponse, StoreSecretRequest, UserType, UtilityProvider, UtilitySecretType, PlatformUserApiServiceCredentials } from '@agent-base/types';
import { PlatformUser } from '@agent-base/types';
import { storeSecretExternalApiClient } from '@agent-base/api-client';


/**
 * API Route: POST /api/secrets/store-secret
 * 
 * Handles the submission of multiple secrets from the frontend.
 * 1. Authenticates the user.
 * 2. Retrieves a platform API key.
 * 3. Forwards the request to the secret-service via the API gateway to securely store each secret.
 *    Makes one call per secret to the service.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication & Authorization
    const token = getAuthToken(req);
    if (!token) {
      console.error('[API /secrets/store-secret] Error getting auth token:', token);
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // Get API key for the user (using "Playground" key like other endpoints)
    // Consider if a more specific key or different key handling is needed for secrets.
    const platformApiKey: string = await getOrCreateKeyByName(token, "Playground");

    // Get platform client user id from token
    const platformUserResponse : ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success || !platformUserResponse.data?.id) {
      console.error('[API /secrets/store-secret] Error getting platform user from token:', platformUserResponse);
      return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to retrieve user information');
    }
    const platformClientUserId = platformUserResponse.data.id;

    // 2. Parse Request Body
    if (req.headers.get('content-type') !== 'application/json') {
      console.error('[API /secrets/store-secret] Invalid content type:', req.headers.get('content-type'));
      return createErrorResponse(415, 'INVALID_CONTENT_TYPE', 'Invalid content type');
    }

    // Use the defined interface for the request body
    const { secrets, secretUtilityProvider } = await req.json();

    // Basic validation: Check if secrets object exists and is an object
    if (!secrets || typeof secrets !== 'object' || Array.isArray(secrets)) {
      console.warn('[API /secrets/store-secret] Missing or invalid secrets payload format (must be an object)');
      return createErrorResponse(400, 'BAD_REQUEST', 'Invalid secrets payload format (must be an object)');
    }

    // Basic validation: Check if secretUtilityProvider is provided
    if (!secretUtilityProvider || typeof secretUtilityProvider !== 'string' || !Object.values(UtilityProvider).includes(secretUtilityProvider as UtilityProvider)) {
      console.warn('[API /secrets/store-secret] Missing or invalid secretUtilityProvider');
      return createErrorResponse(400, 'BAD_REQUEST', 'Missing or invalid secretUtilityProvider');
    }

    // If secrets object is empty, consider it a success (nothing to store)
    if (Object.keys(secrets).length === 0) {
      console.log('[API /secrets/store-secret] Received empty secrets object, nothing to store.');
      return createSuccessResponse({ message: 'No secrets provided to store.' }, 200);
    }

    // 3. Call Secret Service for each secret

    
    // Use Object.entries with type assertion for secrets
    for (const [secretType, secretValue] of Object.entries(secrets as Record<string, any>)) {
      try {
        const externalApiServiceCredentials: PlatformUserApiServiceCredentials = {
          platformClientUserId,
          platformApiKey
        };
        const storeSecretRequest: StoreSecretRequest = {
          userType: UserType.Client,
          secretUtilityProvider: secretUtilityProvider as UtilityProvider,
          secretType: secretType as UtilitySecretType,
          secretValue: secretValue as string
        };
        // Type the expected response from callApiService
        const serviceResponse: ServiceResponse<string> = await storeSecretExternalApiClient(
          storeSecretRequest,
          externalApiServiceCredentials
        );

        // Add result to the array, conforming to SecretStoreResult
        if (!serviceResponse.success) {
          // Handle error case
          // Assert the type to access the error property correctly
          const errorResponse = serviceResponse as ServiceResponse<never>; // Cast to access error
          // results.push(serviceResponse); // No need to push error result before throwing
          
          // Throw error after adding the result
          const errorMessage = typeof errorResponse.error === 'string' 
            ? errorResponse.error 
            : JSON.stringify(errorResponse.error) || 'Unknown error from secret service';
          console.error(`[API /secrets/store-secret] Failed to store secret type ${secretType}:`, errorMessage);
          // Throw immediately on first failure
          throw new Error(`Failed to store secret: ${secretType}. Reason: ${errorMessage}`);
        }
      } catch (error: any) {
        console.error(`[API /secrets/store-secret] Error calling secret service for type ${secretType}:`, error);
        // Re-throw to be caught by the outer catch block
        throw error; 
      }
    }

    // 4. Return Aggregate Success Response
    // If loop completes without throwing, all secrets were stored successfully
    console.log('[API /secrets/store-secret] All secrets stored successfully.');
    // Return a simple success message string, compatible with frontend check and service response type
    return createSuccessResponse("All secrets stored successfully", 200); 

  } catch (error: any) {
    console.error('Error in /api/secrets/store-secret:', error);
    const errorMessage = error.message || 'An internal server error occurred while storing secrets';
    return handleApiError(error, errorMessage);
  }
} 