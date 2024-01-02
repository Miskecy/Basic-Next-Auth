'use client';

import { logout } from '@/server/actions/logout';

interface SignOutButtonProps {
    children?: React.ReactNode;
}

export const SignOutButton = ({ children }: SignOutButtonProps) => {
    const onClick = () => {
        logout();
    };
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
};
