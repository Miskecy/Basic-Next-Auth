'use client';

import SignInButton from '@/components/auth/sign-in-button';
import { Button } from '@/components/ui/button';
import { trpc } from './_trpc/client';

const HomePage = () => {
    const { data: publicTest } = trpc.publicTest.useQuery();
    const { data: protectedTest } = trpc.protectTest.useQuery();

    return (
        // trick to get the background color gradient
        //bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700 to-gray-950
        <main className="flex h-full flex-col items-center justify-center ">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold drop-shadow-md">
                    Basic Next.js Auth
                </h1>
                <p className="text-md">
                    A simple authentication app built with Next.js and Prisma
                </p>
                <pre>{JSON.stringify(publicTest)}</pre>
                <pre>{JSON.stringify(protectedTest)}</pre>
                <div>
                    <SignInButton mode="modal" asChild>
                        <Button
                            size="lg"
                            variant="default"
                            className="font-bold"
                        >
                            Sign In
                        </Button>
                    </SignInButton>
                </div>
            </div>
        </main>
    );
};

export default HomePage;
