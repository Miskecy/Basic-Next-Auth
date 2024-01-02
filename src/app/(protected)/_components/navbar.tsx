'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { UserButton } from '@/components/auth/user-button';

const Navbar = () => {
    const pathname = usePathname();
    return (
        <nav className="border flex justify-between items-center w-[600px] shadow-sm p-4 rounded-xl">
            <div className="space-x-4">
                <Button
                    variant={pathname === '/server' ? 'secondary' : 'ghost'}
                    asChild
                >
                    <Link href="/server">Server</Link>
                </Button>
                <Button
                    variant={pathname === '/client' ? 'default' : 'ghost'}
                    asChild
                >
                    <Link href="/client">Client</Link>
                </Button>
                <Button
                    variant={pathname === '/admin' ? 'default' : 'ghost'}
                    asChild
                >
                    <Link href="/admin">Admin</Link>
                </Button>
                <Button
                    variant={pathname === '/settings' ? 'secondary' : 'ghost'}
                    asChild
                >
                    <Link href="/settings">Settings</Link>
                </Button>
            </div>
            <UserButton />
        </nav>
    );
};

export default Navbar;
