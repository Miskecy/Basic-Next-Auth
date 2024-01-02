'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT_URL } from '@/routes';

const Social = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl');

    const onClick = (provider: 'google' | 'github') => {
        signIn(provider, {
            callbackUrl: callbackUrl ?? DEFAULT_LOGIN_REDIRECT_URL,
        });
    };

    return (
        <div className="flex items-center w-full gap-x-2">
            <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-x-2 w-full"
                onClick={() => onClick('google')}
            >
                <FcGoogle className="text-xl" />
                <span>Google</span>
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="flex items-center gap-x-2 w-full"
                onClick={() => onClick('github')}
            >
                <FaGithub className="text-xl" />
                <span>GitHub</span>
            </Button>
        </div>
    );
};

export default Social;
