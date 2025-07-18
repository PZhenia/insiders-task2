import React from "react";

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <div className="p-3 bg-rose-100 text-rose-800 rounded-lg border border-rose-200 text-sm">
        {message}
    </div>
);

export default ErrorMessage;
