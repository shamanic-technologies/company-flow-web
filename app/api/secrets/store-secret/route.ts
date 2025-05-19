import { NextResponse, NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  getAuthToken,
  callApiService, // Using this generic function to call via API Gateway
  handleApiError
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { ServiceResponse,
  StoreSecretRequest,
  StoreActionConfirmationRequest,
  UserType,
  UtilityProvider,
  UtilitySecretType,
  PlatformUserApiServiceCredentials,
  UtilityProviderEnum
} from '@agent-base/types';
import { PlatformUser } from '@agent-base/types';
import { storeSecretExternalApiClient } from '@agent-base/api-client';
import { auth } from '@clerk/nextjs/server';


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
    
    const { userId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    
    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/get-or-create] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }

    // Check if the API key is configured
    if (!agentBaseApiKey) {
      console.error('[API /agents/get-or-create] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    const platformUserApiServiceCredentials: PlatformUserApiServiceCredentials = {
        platformClientUserId: userId,
        platformApiKey: agentBaseApiKey // Assuming the fetched apiKey is the platformApiKey
    };

    // 2. Parse Request Body
    if (req.headers.get('content-type') !== 'application/json') {
      console.error('[API /secrets/store-secret] Invalid content type:', req.headers.get('content-type'));
      return createErrorResponse(415, 'INVALID_CONTENT_TYPE', 'Invalid content type');
    }

    // Use the defined interface for the request body
    const { secrets, secretUtilityProvider, secretUtilitySubProvider } = await req.json();

    // Basic validation: Check if secrets object exists and is an object
    if (!secrets || typeof secrets !== 'object' || Array.isArray(secrets)) {
      console.warn('[API /secrets/store-secret] Missing or invalid secrets payload format (must be an object)');
      return createErrorResponse(400, 'BAD_REQUEST', 'Invalid secrets payload format (must be an object)');
    }

    // Basic validation: Check if secretUtilityProvider is provided and is a non-empty string
    if (!secretUtilityProvider || typeof secretUtilityProvider !== 'string' || secretUtilityProvider.trim() === '') {
      console.warn('[API /secrets/store-secret] Missing or invalid secretUtilityProvider (must be a non-empty string)');
      return createErrorResponse(400, 'BAD_REQUEST', 'Missing or invalid secretUtilityProvider (must be a non-empty string)');
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
        const storeSecretRequest: StoreSecretRequest = {
          userType: UserType.Client,
          secretUtilityProvider: secretUtilityProvider as UtilityProvider,
          secretUtilitySubProvider: secretUtilitySubProvider as string,
          secretType: secretType as UtilitySecretType,
          secretValue: secretValue as string
        };
        // Type the expected response from callApiService
        const serviceResponse: ServiceResponse<string> = await storeSecretExternalApiClient(
          storeSecretRequest,
          platformUserApiServiceCredentials
        );

        // Add result to the array, conforming to SecretStoreResult
        if (!serviceResponse.success) {
          console.error(`[API /secrets/store-secret] Failed to store secret type ${secretType}:`, serviceResponse.error);
          return createErrorResponse(500, 'INTERNAL_SERVER_ERROR', 'Failed to store secret', serviceResponse.error);
        }
      } catch (error: any) {
        console.error(`[API /secrets/store-secret] Error calling secret service for type ${secretType}:`, error);
        // Re-throw to be caught by the outer catch block
        throw error; 
      }
    }

    // 4. Return Aggregate Success Response
    return createSuccessResponse("All secrets stored successfully", 200); 

  } catch (error: any) {
    console.error('Error in /api/secrets/store-secret:', error);
    const errorMessage = error.message || 'An internal server error occurred while storing secrets';
    return handleApiError(error, errorMessage);
  }
} 