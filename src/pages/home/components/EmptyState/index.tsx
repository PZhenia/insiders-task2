import React from "react";
import { NavLink } from "react-router";

const EmptyState: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-sky-200 text-center">
        <p className="text-gray-600">No to-do lists are available</p>
        <NavLink
            to="/create-todo-list"
            className="mt-4 inline-block px-4 py-2 bg-teal-500 text-white
            rounded-md hover:bg-teal-600 transition-colors"
        >
            Create your first list
        </NavLink>
    </div>
);

export default EmptyState;
