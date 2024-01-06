'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { trpc } from '@/app/_trpc/client';
import { NewPasswordSchema } from '@/schemas';
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

const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: '',
            passwordConfirm: '',
        },
    });

    const { mutate: TRPCNewPassword, isLoading } = trpc.newPassword.useMutation(
        {
            onError: error => setError(error.message),
            onSettled: res => {
                if (!res) return;

                if ('success' in res) {
                    setSuccess(res.success);
                }
            },
        }
    );

    const onSubmit = (data: z.infer<typeof NewPasswordSchema>) => {
        setError('');
        setSuccess('');

        TRPCNewPassword({
            data,
            token,
        });
    };

    return (
        <CardWrapper
            headerLabel="Enter your new password"
            backButtonLabel="Back to Sign In"
            backButtonHref="/auth/sign-in"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
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
                                    <FormLabel>
                                        New Password Confirmation
                                    </FormLabel>
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
                        Reset Password
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default NewPasswordForm;
