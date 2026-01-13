import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OnlyFriends - Gifting for the People You Love',
  description: 'The simplest way to organize wishlists and gift exchanges with your friends and family. No ads, no friction.',
  openGraph: {
    title: 'OnlyFriends - Gifting for the People You Love',
    description: 'The simplest way to organize wishlists and gift exchanges with your friends and family. No ads, no friction.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
