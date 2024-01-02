import { ExtendedUser } from '@/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from './ui/badge';

import { IconType } from 'react-icons';

interface UserInfoProps {
    user?: ExtendedUser;
    label: string;
    icon?: IconType;
}

const UserInfo = ({ user, label, icon: Icon }: UserInfoProps) => {
    return (
        <Card className="w-[600px] shadow-md">
            <CardHeader>
                <div className="flex items-center justify-center gap-2">
                    {Icon && <Icon className="text-3xl" />}
                    <p className="text-2xl font-semibold">{label}</p>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className="text-sm font-medium">ID</p>
                    <p className="truncate text-xs max-w-[180px]">{user?.id}</p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className="text-sm font-medium">Name</p>
                    <p className="truncate text-xs max-w-[180px] capitalize">
                        {user?.name}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className="text-sm font-medium">Email</p>
                    <p className="truncate text-xs max-w-[180px]">
                        {user?.email}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className="text-sm font-medium">Role</p>
                    <p className="truncate text-xs max-w-[180px] capitalize">
                        {user?.role.toLocaleLowerCase()}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <p className="text-sm font-medium">
                        Two Factor Authentication (2FA)
                    </p>
                    <div className="truncate text-xs max-w-[180px] capitalize">
                        <Badge
                            variant={
                                user?.isTwoFactorEnabled
                                    ? 'success'
                                    : 'destructive'
                            }
                        >
                            {user?.isTwoFactorEnabled ? 'ON' : 'OFF'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserInfo;
