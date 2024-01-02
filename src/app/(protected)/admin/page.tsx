'use client';

import RoleGate from '@/components/auth/role-gate';
import FormSuccess from '@/components/form-success';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { admin } from '@/server/actions/admin';
import { UserRole } from '@prisma/client';
import { toast as sonner } from 'sonner';

import { GiBossKey } from 'react-icons/gi';

const AdminPage = () => {
    const onServerRouteClick = () => {
        admin().then(res => {
            if (res.success) {
                sonner.success('Allowed Server Route!');
            }

            if (res.error) {
                sonner.error('Forbidden Server Route!');
            }
        });
    };

    const onApiRouteClclick = () => {
        fetch('/api/admin').then(res => {
            if (res.ok) {
                sonner.success('Allowed API Route!');
            } else {
                sonner.error('Forbidden API Route!');
            }
        });
    };

    return (
        <Card className="w-[600px]">
            <CardHeader className="text-2xl font-semibold">
                <div className="flex items-center justify-center gap-1">
                    <GiBossKey className="text-3xl" />
                    <p>Admin Page</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <RoleGate allowedRoles={UserRole.ADMIN}>
                    <FormSuccess
                        message={`You are allowed to see this content!`}
                    />
                </RoleGate>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
                    <p>Admin-only API Route</p>
                    <Button onClick={onApiRouteClclick}>Click to test</Button>
                </div>

                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
                    <p>Admin-only Server Route</p>
                    <Button onClick={onServerRouteClick}>Click to test</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminPage;
