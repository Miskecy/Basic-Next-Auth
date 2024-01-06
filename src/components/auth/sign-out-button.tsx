'use client';

import { useRouter } from 'next/navigation';

import { trpc } from '@/app/_trpc/client';

interface SignOutButtonProps {
    children?: React.ReactNode;
}

export const SignOutButton = ({ children }: SignOutButtonProps) => {
    const router = useRouter();

    const { mutate: logout } = trpc.logout.useMutation({
        onSuccess: () => {
            router.push('/auth/sign-in');
        },
    });

    const onClick = () => {
        logout();
    };
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
};
