'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition } from 'react';

import { trpc } from '@/app/_trpc/client';
import { SignUpSchema } from '@/schemas';
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

const SignUpForm = () => {
    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email: '',
            password: '',
            passwordConfirm: '',
            name: '',
        },
    });

    const { mutate: TRPCRegister, isLoading } = trpc.register.useMutation({
        onSettled: res => {
            if (!res) return;

            if ('error' in res) {
                setError(res.error);
            }

            if ('success' in res) {
                setSuccess(res.success);
            }
        },
    });

    const onSubmit = (data: z.infer<typeof SignUpSchema>) => {
        setError('');
        setSuccess('');

        TRPCRegister({
            data,
        });
    };
    return (
        <CardWrapper
            headerLabel="Create an account"
            backButtonLabel="Already have an account? Sign In"
            backButtonHref="/auth/sign-in"
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="John Doe"
                                            disabled={isLoading}
                                            type="text"
                                        />
                                    </FormControl>
                                    <FormMessage {...field} />
                                </FormItem>
                            )}
                        />
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
                                            disabled={isLoading}
                                            type="email"
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
                                    <FormMessage {...field} />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="passwordConfirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password Confirmation</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="********"
                                            type="password"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage {...field} />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        type="submit"
                        className="w-full font-semibold"
                        disabled={isLoading}
                    >
                        Sign Up
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default SignUpForm;
