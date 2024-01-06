'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BeatLoader } from 'react-spinners';

import CardWrapper from '@/components/auth/card-wrapper';
import FormSuccess from '@/components/form-success';
import FormError from '@/components/form-error';
import { trpc } from '@/app/_trpc/client';

const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);

    const searchParams = useSearchParams();

    const token = searchParams.get('token');

    const { mutate: EmailConfirmation } = trpc.emailConfirmation.useMutation({
        onError: error => setError(error.message),
        onSettled: res => {
            if (!res) return;

            if ('success' in res) {
                setSuccess(res.success);
            }
        },
    });

    const onsubmit = useCallback(() => {
        if (success || error) return;

        EmailConfirmation({
            token,
        });
    }, [EmailConfirmation, error, success, token]);

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
