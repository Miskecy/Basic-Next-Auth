'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BeatLoader } from 'react-spinners';

import { newVerification } from '@/server/actions/new-verification';
import CardWrapper from '@/components/auth/card-wrapper';
import FormSuccess from '@/components/form-success';
import FormError from '@/components/form-error';

const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);

    const searchParams = useSearchParams();

    const token = searchParams.get('token');

    const onsubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError('Missing token');
            return;
        }

        newVerification(token)
            .then(res => {
                setError(res.error);
                setSuccess(res.success);
            })
            .catch(() => {
                setError('Failed to confirm email address');
            });
    }, [token, error, success]);

    // In development, this will be called Twice.
    // Once on the server, and once on the client.
    // In production, this will only be called once.
    // And will cause a error "Token does not exist"
    useEffect(() => {
        onsubmit();
    }, [onsubmit]);

    return (
        <CardWrapper
            headerLabel="Confirming your email address"
            backButtonHref="/auth/sign-in"
            backButtonLabel="Back to Sign in"
        >
            <div className="flex items-center w-full justify-center">
                {!success && !error ? <BeatLoader color="#fff" /> : null}
                <FormSuccess message={success} />
                {!success ? <FormError message={error} /> : null}
            </div>
        </CardWrapper>
    );
};

export default NewVerificationForm;
