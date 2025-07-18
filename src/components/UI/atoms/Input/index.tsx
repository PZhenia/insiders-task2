import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-sky-800 mb-1">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-2 rounded-lg border border-sky-300
                       focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
    </div>
);

export default Input;
