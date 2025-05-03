'use client';

import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';

/**
 * PricingSection Component
 * Displays the pricing plans section of the landing page.
 * TODO: Wire up buttons to trigger the intended "Start Building" dialog/action.
 */
export function PricingSection() {
  const plans = [
    {
      title: 'Free',
      description: 'Perfect for trying out our platform',
      price: '$0',
      period: 'one-time',
      credits: '100 credits',
      features: [
        'All features available',
        'Low rate limits'
      ],
      buttonLabel: 'Get Started',
      buttonId: 'home-pricing-free-cta',
      popular: false,
      gradient: false,
    },
    {
      title: 'Hobby',
      description: 'For individual developers',
      price: '$16',
      period: '/month',
      credits: '2,000 credits per month',
      features: [
        'All features available',
        'Community support',
        '2,000 credits per month'
      ],
      buttonLabel: 'Subscribe',
      buttonId: 'home-pricing-hobby-cta',
      popular: false,
      gradient: false,
    },
    {
      title: 'Standard',
      description: 'For growing teams',
      price: '$83',
      period: '/month',
      credits: '10,000 credits per month',
      features: [
        'All features available',
        'Standard support',
        'Advanced analytics',
        '10,000 credits per month'
      ],
      buttonLabel: 'Subscribe',
      buttonId: 'home-pricing-standard-cta',
      popular: true,
      gradient: true,
    },
    {
      title: 'Growth',
      description: 'For larger organizations',
      price: '$333',
      period: '/month',
      credits: '50,000 credits per month',
      features: [
        'All features available',
        'Priority support',
        'Custom integrations',
        '50,000 credits per month'
      ],
      buttonLabel: 'Subscribe',
      buttonId: 'home-pricing-growth-cta',
      popular: false,
      gradient: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-900/90 to-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-blue-950 text-blue-300 border border-blue-800 mb-4">
            <Sparkles className="h-4 w-4 mr-2"/> Transparent Pricing
          </span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Flexible Pricing</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start for free, then scale as you grow. Pay only for what you use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.title} className={plan.popular ? "relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <Card className={`bg-gray-900 border ${plan.popular ? 'border-blue-700 shadow-lg shadow-blue-900/20' : 'border-gray-800'} overflow-hidden h-full flex flex-col`}>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-100">{plan.title}</CardTitle>
                  <CardDescription className="text-gray-400 min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-100">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{plan.credits}</p>
                </CardHeader>
                <CardContent className="space-y-4 flex-grow">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-gray-300">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto pt-6">
                  <Button
                    className={`w-full text-white ${plan.gradient ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => console.log(`Pricing button clicked: ${plan.buttonId}`)}
                  >
                    {plan.buttonLabel}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <ButtonLink
            href="/pricing"
            color="secondary"
          >
            See Full Pricing Details <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
} 