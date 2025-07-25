import Stripe from "stripe";

// Initialize Stripe client instance
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

// /**
//  * Get Stripe price ID for a plan
//  */
// export async function getStripePriceId(planId: string): Promise<string> {
//     const plan = PlansList.find(p => p.id === planId);
    
//     if (!plan) {
//       console.error(`[getStripePriceId] Plan details not found for planId: ${planId}`);
//       throw new Error(`Plan details not found for ${planId}.`);
//     }
  
//     if (!plan.priceId) {
//       console.error(`[getStripePriceId] Stripe Price ID is not configured for plan: ${plan.name} (ID: ${planId}). Corresponding environment variable for priceId might be missing or incorrect.`);
//       throw new Error(`Stripe Price ID not configured for ${plan.name} plan. Check server logs and environment variables for its priceId.`);
//     }
    
//     // Verify the price exists in Stripe
//     try {
//       await stripeClient.prices.retrieve(plan.priceId);
//       return plan.priceId;
//     } catch (error) {
//       console.error(`[getStripePriceId] Price ${plan.priceId} not found for ${plan.name} (ID: ${planId}):`, error);
//       throw new Error(`Price not found for ${plan.name} plan. Please check your Stripe configuration and ensure priceId '${plan.priceId}' is correct.`);
//     }
//   }