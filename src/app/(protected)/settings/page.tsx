'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { UserRole } from '@prisma/client';

import { SettingsSchema } from '@/schemas';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { settings } from '@/server/actions/settings';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/app/hooks/use-current-user';
import FormSuccess from '@/components/form-success';
import FormError from '@/components/form-error';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { HiCog8Tooth } from 'react-icons/hi2';

const SettingsPage = () => {
    const user = useCurrentUser();
    const { update } = useSession();

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const form = useForm<z.infer<typeof SettingsSchema>>({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            name: user?.name ?? undefined,
            email: user?.email ?? undefined,
            password: undefined,
            newPassword: undefined,
            newPasswordConfirm: undefined,
            role: user?.role ?? undefined,
        },
    });

    const onSubmit = (data: z.infer<typeof SettingsSchema>) => {
        setError(undefined);
        setSuccess(undefined);

        startTransition(() => {
            settings(data)
                .then(res => {
                    if (res.error) {
                        setError(res.error);
                    }

                    if (res.success) {
                        update();
                        setSuccess(res.success);
                    }
                })
                .catch(() => setError('Something went wrong'));
        });
    };
    return (
        <Card className="w-[600px]">
            <CardHeader className="text-2xl font-semibold">
                <div className="flex gap-1 items-center justify-center">
                    <HiCog8Tooth className="text-3xl" />
                    <p>Settings</p>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
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
                                                placeholder="John Doe"
                                                {...field}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="john.doe@mail.com"
                                                        type="email"
                                                        {...field}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
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
                                                        placeholder="********"
                                                        type="password"
                                                        {...field}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    New Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="********"
                                                        type="password"
                                                        {...field}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="newPasswordConfirm"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    New Password Confirmation
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="********"
                                                        type="password"
                                                        {...field}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : null}

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <Select
                                                disabled={isPending}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={UserRole.ADMIN}
                                                    >
                                                        Admin
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={UserRole.USER}
                                                    >
                                                        User
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {user?.isOAuth === false ? (
                                <FormField
                                    control={form.control}
                                    name="isTwoFactorEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>
                                                    Two Factor Authentication
                                                </FormLabel>
                                                <FormDescription>
                                                    Enable two factor
                                                    authentication for your
                                                    account
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    disabled={isPending}
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            ) : null}
                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default SettingsPage;
