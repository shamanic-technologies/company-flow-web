'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavigationBar } from '@/components/landing/NavigationBar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Check, CheckCircle2, HelpCircle, Sparkles, Zap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Pricing Page
 * Displays the pricing options for the platform.
 */
export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleBillingCycleChange = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
  };

  /**
   * Dispatches an event to open the contact dialog.
   * @param buttonId - A unique identifier for the button that was clicked.
   */
  const openContactDialog = (buttonId: string) => {
    window.dispatchEvent(new CustomEvent('openSignInDialog', { detail: { buttonId } }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <NavigationBar />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-blue-950/50 via-gray-950 to-indigo-950/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-blue-950 text-blue-300 border border-blue-800 mb-4">
              <Sparkles className="h-4 w-4 mr-2"/> Transparent Pricing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-100 mb-6">
              Flexible <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Start for free, then scale as you grow. Pay only for what you use.
            </p>
            
            <div className="inline-flex items-center justify-center space-x-2 mb-12">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-100" : "text-gray-400"}`}>Monthly</span>
              <Switch 
                checked={billingCycle === "yearly"} 
                onCheckedChange={handleBillingCycleChange}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className={`text-sm font-medium flex items-center ${billingCycle === "yearly" ? "text-gray-100" : "text-gray-400"}`}>
                Yearly
                <span className="ml-2 bg-blue-900/70 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                  Save 16%
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <motion.section 
          className="py-16 px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Free Plan */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900 border-gray-800 overflow-hidden h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-100">Free</CardTitle>
                    <CardDescription className="text-gray-400">
                      Perfect for trying out our platform
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-100">$0</span>
                      <span className="text-gray-500 ml-1">one-time</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">100 credits</p>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>All features available</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Low rate limits</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openContactDialog('pricing-page-free-cta')}>
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Hobby Plan */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900 border-gray-800 overflow-hidden h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-100">Hobby</CardTitle>
                    <CardDescription className="text-gray-400">
                      For individual developers and small projects
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-100">
                        ${billingCycle === "monthly" ? "16" : "13"}
                      </span>
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === "monthly" ? "month" : "month"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {billingCycle === "monthly" ? "$192/year" : "$156/year (billed annually)"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>2,000 credits per month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Community support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openContactDialog('pricing-page-hobby-cta')}>
                      Subscribe
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Standard Plan */}
              <motion.div variants={itemVariants} className="relative">
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    Most Popular
                  </span>
                </div>
                <Card className="bg-gradient-to-b from-gray-900 to-gray-900 border-blue-700 overflow-hidden h-full flex flex-col shadow-lg shadow-blue-900/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-100">Standard</CardTitle>
                    <CardDescription className="text-gray-400">
                      For growing teams and businesses
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-100">
                        ${billingCycle === "monthly" ? "83" : "69"}
                      </span>
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === "monthly" ? "month" : "month"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {billingCycle === "monthly" ? "$996/year" : "$828/year (billed annually)"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>10,000 credits per month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Standard support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Advanced analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white" onClick={() => openContactDialog('pricing-page-standard-cta')}>
                      Subscribe
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Growth Plan */}
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900 border-gray-800 overflow-hidden h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-100">Growth</CardTitle>
                    <CardDescription className="text-gray-400">
                      For larger organizations with high volume
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-100">
                        ${billingCycle === "monthly" ? "333" : "278"}
                      </span>
                      <span className="text-gray-500 ml-1">
                        /{billingCycle === "monthly" ? "month" : "month"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {billingCycle === "monthly" ? "$3,996/year" : "$3,336/year (billed annually)"}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>50,000 credits per month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Priority support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Custom integrations</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto pt-6">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openContactDialog('pricing-page-growth-cta')}>
                      Subscribe
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Enterprise Section */}
        <section className="py-12 px-4 bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/80 border border-gray-800 rounded-lg p-8 md:p-12">
              <div className="md:flex justify-between items-center">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">Enterprise Plan</h3>
                  <p className="text-gray-400 mb-4">Unlimited credits. Custom RPMs. SLAs and dedicated support.</p>
                  <ul className="grid grid-cols-2 gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">Top priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">Bulk discounts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">SLAs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">Custom concurrency</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">Advanced security</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-gray-300">Private deployment</span>
                    </li>
                  </ul>
                </div>
                <div className="shrink-0">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-base h-auto" onClick={() => openContactDialog('pricing-page-enterprise-cta')}>
                    Talk to Sales
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-100 mb-8 text-center">Add-ons</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Auto Recharge Add-on */}
              <Card className="bg-gray-900 border-gray-800 flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-100">Auto Recharge Credits</CardTitle>
                  <CardDescription className="text-gray-400">
                    Automatically recharge your credits when you run low
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-gray-100">$11</span>
                    <span className="text-gray-500 ml-1">/mo for 1000 credits</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-6">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openContactDialog('pricing-page-recharge-cta')}>
                    Enable Auto Recharge
                  </Button>
                </CardFooter>
              </Card>

              {/* Credit Pack Add-on */}
              <Card className="bg-gray-900 border-gray-800 flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-100">Credit Pack</CardTitle>
                  <CardDescription className="text-gray-400">
                    Purchase a pack of additional monthly credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-baseline mb-4">
                    <span className="text-2xl font-bold text-gray-100">$9</span>
                    <span className="text-gray-500 ml-1">/mo for 1000 credits</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-6">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openContactDialog('pricing-page-credit-pack-cta')}>
                    Purchase Credit Pack
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* API Credits Table Section */}
        <section className="py-16 px-4 bg-gray-900/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-100 mb-2 text-center">API Credits</h2>
            <p className="text-gray-400 mb-8 text-center">Credits are consumed for each API request, varying by endpoint and feature.</p>
            
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-800">
                    <TableHead className="text-gray-300">Features</TableHead>
                    <TableHead className="text-gray-300">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b border-gray-800">
                    <TableCell className="font-medium text-gray-300">API call</TableCell>
                    <TableCell className="text-gray-400">1 / call</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-800">
                    <TableCell className="font-medium text-gray-300">LLM call (input tokens)</TableCell>
                    <TableCell className="text-gray-400">1 / thousand input tokens</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-gray-800">
                    <TableCell className="font-medium text-gray-300">LLM call (output tokens)</TableCell>
                    <TableCell className="text-gray-400">3 / thousand output tokens</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* FAQ Accordion would go here */}

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start for free today. No credit card required.
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 text-base"
              onClick={() => openContactDialog('pricing-page-final-cta')}
            >
              Get Started for Free
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 