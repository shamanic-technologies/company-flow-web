'use client';

import Script from 'next/script';

/**
 * Billing Settings Page
 * 
 * This page displays the Stripe Pricing Table, allowing users to view
 * and select subscription plans.
 */
export default function BillingSettingsPage() {
  const pricingTableId = "prctbl_1RSvvZARay5Voldn3MHYJgMm";
  const publishableKey = "pk_test_51RRl3PARay5Voldnj885PUKDBzyJ7SXp4u7zhYRQM6QFpW2vsmHIB2NQX57A3qNcAbne7w3SCm2CDooaw8JQPS6Y00sSSyLpv2";

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Subscription Plans
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Choose the plan that best fits your needs. You can upgrade, downgrade, or manage your subscription.
        </p>
      </header>
      
      {/* Load the Stripe Pricing Table script */}
      <Script async src="https://js.stripe.com/v3/pricing-table.js" strategy="lazyOnload" />
      
      {/* 
        The stripe-pricing-table custom element.
        React supports rendering custom elements. Ensure the attributes are correctly cased.
        For custom elements, attributes are typically kebab-case.
      */}
      <stripe-pricing-table 
        pricing-table-id={pricingTableId}
        publishable-key={publishableKey}
      >
      </stripe-pricing-table>

      {/* 
        Note: If you encounter TypeScript errors related to the <stripe-pricing-table> element,
        you may need to declare it in a global .d.ts file like so:
        
        declare namespace JSX {
          interface IntrinsicElements {
            'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
              'pricing-table-id': string;
              'publishable-key': string;
              // Add any other attributes it might accept
            }, HTMLElement>;
          }
        }
      */}
    </div>
  );
} 