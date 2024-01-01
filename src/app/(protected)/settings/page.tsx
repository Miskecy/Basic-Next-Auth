import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

const SettingsPage = async () => {
    const session = await auth();
    return (
        <div>
            <form
                action={async () => {
                    'use server';

                    await signOut();
                }}
            >
                <Button type="submit">Sign Out</Button>
            </form>
            Settings Page <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
    );
};

export default SettingsPage;
