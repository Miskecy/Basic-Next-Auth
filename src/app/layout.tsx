import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Auth - Basics',
    description: 'A simple authentication app built with Next.js and Prisma',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body
                className={cn(
                    'min-h-screen bg-background antialiased',
                    inter.className
                )}
            >
                {children}
            </body>
        </html>
    );
}
