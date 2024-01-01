import { CheckCircledIcon } from '@radix-ui/react-icons';

interface FormSuccessProps {
    message?: string;
}

const FormSuccess = ({ message }: FormSuccessProps) => {
    if (!message) return null;
    return (
        <div className="bg-white rounded-md">
            <div className=" bg-emerald-500/15 text-emerald-500 font-medium p-3 rounded-md flex items-center gap-x-2 text-sm  ">
                <CheckCircledIcon className="h-4 w-4" />
                <p>{message}</p>
            </div>
        </div>
    );
};

export default FormSuccess;
