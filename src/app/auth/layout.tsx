import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
    title: 'Basic Next.js Auth - Auth',
    description: 'A simple authentication app built with Next.js and Prisma',
};

const AuthLayout = ({ children }: PropsWithChildren) => {
    return (
        <div className="h-full flex items-center justify-center">
            {children}
        </div>
    );
};

export default AuthLayout;
