/**
 * Budget API Functions
 * Utility functions for interacting with the billing API
 */

import { AutoRechargeSettings, BillingData } from './types';

/**
 * Interface for API responses
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  checkoutUrl?: string;
}

/**
 * Interface for payment intent response
 */
interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Fetch billing data from the API
 * @param onLoading - Callback for loading state changes
 * @param onError - Callback for error handling
 * @param onSuccess - Callback for successful data retrieval
 */
export const fetchBillingData = async (
  onLoading?: (loading: boolean) => void,
  onError?: (error: string) => void,
  onSuccess?: (data: BillingData, autoRechargeSettings: AutoRechargeSettings) => void
): Promise<BillingData | null> => {
  try {
    if (onLoading) onLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔄 Budget API: Fetching billing data');
    const response = await fetch('/api/billing', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Budget API: Error response from billing API:', response.status, errorText);
      throw new Error(`Failed to fetch billing data: ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<BillingData>;
    if (!data.success) {
      console.error('❌ Budget API: Unsuccessful response from billing API:', data);
      throw new Error(data.error || 'Failed to fetch billing data');
    }

    console.log('✅ Budget API: Successfully fetched billing data', data);
    
    // Get auto-recharge settings from the data
    let autoRechargeSettings: AutoRechargeSettings = {
      enabled: false,
      thresholdAmount: 5,
      rechargeAmount: 10
    };
    
    if (data.data?.customer?.autoRecharge) {
      console.log('📊 Budget API: Retrieved auto-recharge settings', data.data.customer.autoRecharge);
      autoRechargeSettings = data.data.customer.autoRecharge;
    }
    
    if (onSuccess && data.data) {
      onSuccess(data.data, autoRechargeSettings);
    }
    
    return data.data || null;
  } catch (error) {
    console.error('❌ Budget API: Error fetching billing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch billing data';
    if (onError) onError(errorMessage);
    return null;
  } finally {
    if (onLoading) onLoading(false);
  }
};

/**
 * Save auto-recharge settings
 * @param settings - Auto-recharge settings to save
 * @param onLoading - Callback for loading state changes
 * @param onError - Callback for error handling
 * @param onSuccess - Callback for successful save
 * @returns Whether the operation was successful
 */
export const saveAutoRechargeSettings = async (
  settings: AutoRechargeSettings,
  onLoading?: (loading: boolean) => void,
  onError?: (error: string) => void,
  onSuccess?: () => void
): Promise<boolean> => {
  try {
    if (onLoading) onLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('💾 Budget API: Saving auto-recharge settings', settings);
    
    const response = await fetch('/api/billing/auto-recharge', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Budget API: Error saving auto-recharge settings:', response.status, errorText);
      throw new Error(`Failed to save auto-recharge settings: ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<any>;
    if (!data.success) {
      console.error('❌ Budget API: Unsuccessful response when saving auto-recharge settings:', data);
      throw new Error(data.error || 'Failed to save auto-recharge settings');
    }
    
    console.log('✅ Budget API: Successfully saved auto-recharge settings');
    
    if (onSuccess) onSuccess();
    return true;
  } catch (error) {
    console.error('❌ Budget API: Error saving auto-recharge settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save auto-recharge settings';
    if (onError) onError(errorMessage);
    return false;
  } finally {
    if (onLoading) onLoading(false);
  }
};

/**
 * Process manual recharge
 * @param amount - Amount to recharge
 * @param onLoading - Callback for loading state changes
 * @param onError - Callback for error handling
 * @param onSuccess - Callback for successful recharge with optional redirect URL
 * @returns Whether the operation was successful
 */
export const processManualRecharge = async (
  amount: number,
  onLoading?: (loading: boolean) => void,
  onError?: (error: string) => void,
  onSuccess?: (checkoutUrl?: string) => void
): Promise<boolean> => {
  try {
    if (onLoading) onLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('💰 Budget API: Initiating manual recharge for $' + amount);
    
    // Create payment intent for the recharge
    const response = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Budget API: Error initiating recharge:', response.status, errorText);
      throw new Error(`Failed to initiate recharge: ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<any>;
    if (!data.success) {
      console.error('❌ Budget API: Unsuccessful response when initiating recharge:', data);
      throw new Error(data.error || 'Failed to initiate recharge');
    }
    
    console.log('✅ Budget API: Successfully initiated recharge');
    
    if (onSuccess) onSuccess(data.checkoutUrl);
    return true;
  } catch (error) {
    console.error('❌ Budget API: Error initiating recharge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to initiate recharge';
    if (onError) onError(errorMessage);
    return false;
  } finally {
    if (onLoading) onLoading(false);
  }
};

/**
 * Create a payment intent for direct credit card processing
 * @param amount - Amount to charge
 * @param onLoading - Callback for loading state changes
 * @param onError - Callback for error handling
 * @returns Client secret for payment confirmation
 */
export const createPaymentIntent = async (
  amount: number,
  onLoading?: (loading: boolean) => void,
  onError?: (error: string) => void
): Promise<PaymentIntentResponse | null> => {
  try {
    if (onLoading) onLoading(true);
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    console.log('💳 Budget API: Creating payment intent for $' + amount);
    
    // Create payment intent for the charge
    const response = await fetch('/api/billing/create-payment-intent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Budget API: Error creating payment intent:', response.status, errorText);
      throw new Error(`Failed to create payment intent: ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<PaymentIntentResponse>;
    if (!data.success) {
      console.error('❌ Budget API: Unsuccessful response when creating payment intent:', data);
      throw new Error(data.error || 'Failed to create payment intent');
    }
    
    console.log('✅ Budget API: Successfully created payment intent');
    
    return data.data || null;
  } catch (error) {
    console.error('❌ Budget API: Error creating payment intent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
    if (onError) onError(errorMessage);
    return null;
  } finally {
    if (onLoading) onLoading(false);
  }
};

/**
 * Process card payment and confirm payment intent
 * @param paymentIntentId ID of the payment intent to confirm
 * @param paymentMethodId Payment method ID from Stripe
 * @param setLoading Optional callback for loading state
 * @param setError Optional callback for error state
 */
export const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string,
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
): Promise<void> => {
  if (setLoading) setLoading(true);
  if (setError) setError(null);
  
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log('Confirming payment');
    
    // Confirm payment through API
    const response = await fetch('/api/billing/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        paymentIntentId,
        paymentMethodId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error confirming payment: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    console.error('Error confirming payment:', error);
    if (setError) setError(error instanceof Error ? error.message : 'Failed to confirm payment');
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Initiate a credits recharge using checkout page
 * @param amount Amount to recharge in dollars
 * @param setLoading Optional callback for loading state
 * @param setError Optional callback for error state
 */
export const rechargeCredits = async (
  amount: number,
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
): Promise<void> => {
  if (setLoading) setLoading(true);
  if (setError) setError(null);
  
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log('Initiating credit recharge for', amount);
    
    // Create checkout session through API
    const response = await fetch('/api/billing/recharge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      throw new Error(`Error initiating recharge: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Redirect to checkout if URL is provided
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
  } catch (error) {
    console.error('Error initiating recharge:', error);
    if (setError) setError(error instanceof Error ? error.message : 'Failed to initiate recharge');
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Update auto-recharge settings
 * @param settings New auto-recharge settings
 * @param setLoading Optional callback for loading state
 * @param setError Optional callback for error state
 */
export const updateAutoRechargeSettings = async (
  settings: AutoRechargeSettings,
  setLoading?: (loading: boolean) => void,
  setError?: (error: string | null) => void
): Promise<void> => {
  if (setLoading) setLoading(true);
  if (setError) setError(null);
  
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    console.log('Updating auto-recharge settings', settings);
    
    // Update settings through API
    const response = await fetch('/api/billing/auto-recharge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error(`Error updating auto-recharge settings: ${response.statusText}`);
    }
    
    await response.json();
  } catch (error) {
    console.error('Error updating auto-recharge settings:', error);
    if (setError) setError(error instanceof Error ? error.message : 'Failed to update auto-recharge settings');
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
}; 