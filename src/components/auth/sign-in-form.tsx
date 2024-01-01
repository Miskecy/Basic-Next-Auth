'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import { SignInSchema } from '@/schemas';
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
import { login } from '@/server/actions/login';
import Link from 'next/link';

const SignInForm = () => {
    const searchParams = useSearchParams();
    const urlError =
        searchParams.get('error') === 'OAuthAccountNotLinked'
            ? 'Email already in use with different provider!'
            : undefined;

    const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {
            email: '',
            password: '',
            code: '',
        },
    });

    const onSubmit = (data: z.infer<typeof SignInSchema>) => {
        setError('');
        setSuccess('');

        // Server side validation
        startTransition(() => {
            login(data)
                .then(res => {
                    if (res?.error) {
                        form.reset();
                        setError(res.error);
                    }

                    if (res?.success) {
                        form.reset();
                        setSuccess(res.success);
                    }

                    if (res?.twoFactor) {
                        setShowTwoFactor(true);
                    }
                })
                .catch(() => {
                    setError('Something went wrong!');
                });
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
                                                disabled={isPending}
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
                                                    disabled={isPending}
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
                                                    disabled={isPending}
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
                        disabled={isPending}
                    >
                        {showTwoFactor ? 'Confirm' : 'Sign In'}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default SignInForm;
