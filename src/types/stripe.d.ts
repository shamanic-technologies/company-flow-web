// Types for custom Stripe elements

declare namespace JSX {
  interface IntrinsicElements {
    'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'pricing-table-id': string;
      'publishable-key': string;
      // If your pricing table uses client-reference-id or customer-session-id, declare them here
      'client-reference-id'?: string;
      'customer-session-id'?: string; 
    }, HTMLElement>;
  }
} 