import SignInButton from '@/components/auth/sign-in-button';
import { Button } from '@/components/ui/button';

const HomePage = () => {
    return (
        // trick to get the background color gradient
        //bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700 to-gray-950
        <main className="flex h-full flex-col items-center justify-center ">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-semibold drop-shadow-md">Auth</h1>
                <p className="text-md">A simple authentication service</p>
                <div>
                    <SignInButton>
                        <Button
                            size="lg"
                            variant="default"
                            className="font-bold"
                        >
                            Sign In
                        </Button>
                    </SignInButton>
                </div>
            </div>
        </main>
    );
};

export default HomePage;
