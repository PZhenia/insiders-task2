import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ loading = false, children, ...props }) => (
    <button
        {...props}
        disabled={loading || props.disabled}
        className={`w-full py-2 px-4 rounded-lg font-medium text-white 
                    transition-colors shadow-md hover:shadow-lg ${
            loading
                ? "bg-sky-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700"
        }`}
    >
        {loading ? (
            <span className="flex items-center justify-center">Processing...</span>
        ) : (
            children
        )}
    </button>
);

export default Button;
