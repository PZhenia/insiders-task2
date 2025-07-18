import React from "react";

interface TaskItemProps {
    id: string;
    title: string;
    description?: string;
    done: boolean;
    onToggleDone: () => void;
    onDelete: () => void;
    canDelete: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
                                               title,
                                               description,
                                               done,
                                               onToggleDone,
                                               onDelete,
                                               canDelete,
                                           }) => {
    return (
        <li
            className={`flex items-start gap-3 p-2 rounded-md ${
                done ? "bg-gray-50 text-gray-400" : "hover:bg-sky-50"
            }`}
        >
            <button
                onClick={onToggleDone}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border ${
                    done
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-gray-300 hover:border-teal-500"
                } flex items-center justify-center transition-colors`}
                title="Toggle done"
            >
                {done && "✓"}
            </button>

            <div className="flex-1">
                <p className={`font-medium ${done ? "line-through" : ""}`}>{title}</p>
                {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                )}
            </div>

            {canDelete && (
                <button
                    onClick={onDelete}
                    className="text-rose-600 hover:text-rose-400 transition-colors ml-2"
                    title="Delete task"
                >
                    ✖
                </button>
            )}
        </li>
    );
};

export default TaskItem;
