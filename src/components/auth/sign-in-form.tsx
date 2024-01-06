'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { SignInSchema } from '@/schemas';
import { DEFAULT_LOGIN_REDIRECT_URL } from '@/routes';

import { trpc } from '@/app/_trpc/client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import CardWrapper from '@/components/auth/card-wrapper';
import FormError from '@/components/form-error';
import FormSuccess from '@/components/form-success';

const SignInForm = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl');
    const router = useRouter();
    const { update } = useSession();

    const urlError =
        searchParams.get('error') === 'OAuthAccountNotLinked'
            ? 'Email already in use with different provider!'
            : undefined;

    const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');

    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: '',
            password: '',
            code: '',
        },
    });

    const { mutate: TRPCLogin, isLoading } = trpc.login.useMutation({
        onSuccess: () => {
            update();
            router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT_URL);
        },
        onError: error => setError(error.message),
        onSettled: res => {
            if (!res) return;

            if ('success' in res) {
                form.reset();
                setSuccess(res.success);
            }

            if ('twoFactor' in res) {
                setShowTwoFactor(res.twoFactor);
            }

            router.refresh();
        },
    });

    const onSubmit = (data: z.infer<typeof SignInSchema>) => {
        setError('');
        setSuccess('');

        // Client side validation
        TRPCLogin({
            data,
        });
    };
    return (
        <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/sign-up"
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* <pre>{JSON.stringify(form.getValues(), null, 2)}</pre> */}
                    <div className="space-y-4">
                        {showTwoFactor ? (
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Two Factor Code</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="000000"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage {...field} />
                                    </FormItem>
                                )}
                            />
                        ) : null}

                        {!showTwoFactor ? (
                            <>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="john.doe@mail.com"
                                                    type="email"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="********"
                                                    type="password"
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <Button
                                                size="sm"
                                                variant="link"
                                                asChild
                                                className="px-0 font-normal"
                                            >
                                                <Link href="/auth/forgot-password">
                                                    Forgot Password?
                                                </Link>
                                            </Button>
                                            <FormMessage {...field} />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : null}
                    </div>
                    <FormError message={error || urlError} />
                    <FormSuccess message={success} />
                    <Button
                        type="submit"
                        className="w-full font-semibold"
                        disabled={isLoading}
                    >
                        {showTwoFactor ? 'Confirm' : 'Sign In'}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default SignInForm;
