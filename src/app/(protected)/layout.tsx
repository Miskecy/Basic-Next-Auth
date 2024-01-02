import { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import Navbar from './_components/navbar';

export const metadata: Metadata = {
    title: 'Basic Next.js Auth - Dashboard',
    description: 'A simple authentication app built with Next.js and Prisma',
};

const ProtectedLayout = ({ children }: PropsWithChildren) => {
    return (
        <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center">
            <Navbar />
            {children}
        </div>
    );
};

export default ProtectedLayout;
