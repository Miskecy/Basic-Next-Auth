import UserInfo from '@/components/user-info';
import { currentUser } from '@/lib/auth';

import { FaServer } from 'react-icons/fa';

const ServerPage = async () => {
    const user = await currentUser();

    return <UserInfo user={user} label="Server" icon={FaServer} />;
};

export default ServerPage;
