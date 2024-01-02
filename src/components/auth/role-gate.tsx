'use client';

import { UserRole } from '@prisma/client';
import { useCurrentRole } from '@/app/hooks/use-current-role';
import FormError from '@/components/form-error';

interface RoleGateProps {
    children: React.ReactNode;
    allowedRoles: UserRole;
}

const RoleGate = ({ children, allowedRoles }: RoleGateProps) => {
    const role = useCurrentRole();

    if (role !== allowedRoles) {
        return (
            <FormError message="You are not authorized to view this content." />
        );
    }

    return <>{children}</>;
};

export default RoleGate;
