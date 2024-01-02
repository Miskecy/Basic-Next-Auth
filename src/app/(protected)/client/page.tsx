'use client';

import { useCurrentUser } from '@/app/hooks/use-current-user';
import UserInfo from '@/components/user-info';

import { BsBrowserSafari } from 'react-icons/bs';

const ClientPage = () => {
    const user = useCurrentUser();

    return <UserInfo user={user} label="Client" icon={BsBrowserSafari} />;
};

export default ClientPage;
