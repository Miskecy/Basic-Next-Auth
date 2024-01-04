import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { cn } from '@/lib/utils';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';
import { Toaster as Sonner } from '@/components/ui/sonner';
import TRPCProvider from './_trpc/provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Basic Next.js Auth',
    description: 'A simple authentication app built with Next.js and Prisma',
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    return (
        <SessionProvider session={session}>
            <html lang="en" className="dark">
                <body
                    className={cn(
                        'min-h-screen bg-background antialiased',
                        inter.className
                    )}
                >
                    <Sonner />
                    <TRPCProvider>{children}</TRPCProvider>
                </body>
            </html>
        </SessionProvider>
    );
}
