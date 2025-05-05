import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import React from 'react';

const inter = Inter({ subsets: ["latin"] });

/**
 * Root layout for the Next.js app
 * This defines the structure of all pages in the app
 */
export const metadata: Metadata = {
  title: 'Agent Base | Instant tools for your Agent SaaS',
  description: 'All online tools instantly available without any pre-setup.',
  openGraph: {
    title: 'Agent Base | Instant tools for your Agent SaaS',
    description: 'All online tools instantly available without any pre-setup.',
    images: ['/agent-base-square-logo-dark.png'],
  },
};

/**
 * Root layout component
 * Contains the theme provider and wraps all pages
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
} 