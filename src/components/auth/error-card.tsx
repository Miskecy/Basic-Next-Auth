import CardWrapper from '@/components/auth/card-wrapper';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

const ErrorCard = () => {
    return (
        <CardWrapper
            headerLabel="Oops! Something went wrong!"
            backButtonHref="/auth/sign-in"
            backButtonLabel="Back to Sign In"
        >
            <div className="w-full flex justify-center items-center">
                <ExclamationTriangleIcon className="text-red-400 w-14 h-14" />
            </div>
        </CardWrapper>
    );
};

export default ErrorCard;
