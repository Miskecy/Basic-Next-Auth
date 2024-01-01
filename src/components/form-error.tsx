import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface FormErrorProps {
    message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
    if (!message) return null;
    return (
        <div className="bg-white rounded-md">
            <div className=" bg-destructive/15 text-destructive font-medium p-3 rounded-md flex items-center gap-x-2 text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <p>{message}</p>
            </div>
        </div>
    );
};

export default FormError;
