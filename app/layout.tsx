import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

/**
 * Root layout for the Next.js app
 * This defines the structure of all pages in the app
 */
export const metadata: Metadata = {
  title: 'Company Flow',
  description: 'Streamline your company workflows',
};

/**
 * Root layout component
 * Contains the theme provider and wraps all pages
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="dark scroll-smooth h-full">
        <head>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></Script>
          <Script id="google-analytics">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </head>
        <body className={`${inter.className} antialiased h-full flex flex-col`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
} 