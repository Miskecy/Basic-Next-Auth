import { cn } from '@/lib/utils';

interface HeaderProps {
    label: string;
}

const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-1 items-center justify-center">
            <h1 className="text-xl font-semibold">Auth</h1>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
};

export default Header;
