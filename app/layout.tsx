import './globals.css';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs';

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
      <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
        <body className={`${inter.className} antialiased`}>
            {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
} 