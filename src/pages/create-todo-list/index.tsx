import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router";

import { auth, db } from "../../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

type Task = {
    id: string;
    title: string;
    description: string;
    done: boolean;
};

type Viewer = {
    email: string;
};

type InputProps = {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
};

const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder }) => (
    <div className="mb-3">
        <label className="block text-sm font-medium text-sky-800 mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 rounded-lg border border-sky-300
            focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
    </div>
);

type ErrorMessageProps = {
    message: string;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
    <p className="text-rose-600 text-sm mt-1">{message}</p>
);

const CreateTodoList: React.FC = () => {
    const [listTitle, setListTitle] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [listTitleError, setListTitleError] = useState("");
    const [taskTitleError, setTaskTitleError] = useState("");
    const [taskDescriptionError, setTaskDescriptionError] = useState("");
    const [viewerEmail, setViewerEmail] = useState("");
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [viewerEmailError, setViewerEmailError] = useState("");

    const navigate = useNavigate();

    const user = auth.currentUser;

    const addTask = () => {
        setTaskTitleError("");
        setTaskDescriptionError("");
        setError(null);

        if (taskTitle.trim().length < 1) {
            setTaskTitleError("The task name must not be empty");
            return;
        }
        if (taskDescription.trim().length < 3) {
            setTaskDescriptionError("The description must contain at least 3 characters");
            return;
        }
        if (tasks.find((t) => t.title.toLowerCase() === taskTitle.toLowerCase())) {
            setTaskTitleError("The task name must be unique");
            return;
        }

        const newTask: Task = {
            id: Date.now().toString(),
            title: taskTitle.trim(),
            description: taskDescription.trim(),
            done: false,
        };
        setTasks([...tasks, newTask]);
        setTaskTitle("");
        setTaskDescription("");
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const saveList = async () => {
        setListTitleError("");
        setError(null);

        if (!user) {
            setError("Please log in to the system");
            return;
        }
        if (listTitle.trim().length === 0) {
            setListTitleError("Enter a name for the list");
            return;
        }
        try {
            const docRef = await addDoc(collection(db, "todoLists"), {
                title: listTitle.trim(),
                ownerId: user.uid,
                collaborators: viewers,
            });

            for (const task of tasks) {
                await addDoc(collection(db, `todoLists/${docRef.id}/tasks`), {
                    title: task.title,
                    description: task.description,
                    done: task.done,
                });
            }

            setListTitle("");
            setTasks([]);
            setViewers([]);
            navigate("/");
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(`Error saving the list: ${e.message}`);
            } else {
                setError("Error saving the list");
            }
        }
    };

    const addViewer = async () => {
        setViewerEmailError("");
        setError(null);

        const emailTrimmed = viewerEmail.trim().toLowerCase();

        if (!emailTrimmed) {
            setViewerEmailError("Please enter an email");
            return;
        }

        if (viewers.some((v) => v.email === emailTrimmed)) {
            setViewerEmailError("This email is already added as viewer");
            return;
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", emailTrimmed));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setViewerEmailError("User with this email does not exist");
            return;
        }

        setViewers([...viewers, { email: emailTrimmed }]);
        setViewerEmail("");
    };

    const removeViewer = (email: string) => {
        setViewers(viewers.filter((v) => v.email !== email));
    };

    return (
        <div className="font-nunito min-h-screen bg-sky-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-sky-200">
                    <div className="p-6 bg-sky-800">
                        <h1 className="text-2xl font-bold text-gray-200">Create a new to-do list</h1>
                    </div>

                    <div className="p-6">
                        <Input
                            label="List name"
                            value={listTitle}
                            onChange={(e) => setListTitle(e.target.value)}
                            placeholder="My awesome list"
                        />
                        {listTitleError && <ErrorMessage message={listTitleError} />}

                        <div className="mb-6 p-4 bg-sky-50 rounded-lg">
                            <h2 className="text-lg font-semibold text-sky-800 mb-3">Add a task</h2>

                            <Input
                                label="Task name"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                            />
                            {taskTitleError && <ErrorMessage message={taskTitleError} />}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-sky-700 mb-1">Description</label>
                                <textarea
                                    placeholder="Details..."
                                    value={taskDescription}
                                    onChange={(e) => setTaskDescription(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-sky-300
                                    focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    rows={3}
                                />
                                {taskDescriptionError && <ErrorMessage message={taskDescriptionError} />}
                            </div>

                            <button
                                onClick={addTask}
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4
                                rounded-lg transition-colors shadow-md hover:shadow-lg"
                            >
                                Add Task
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-rose-100 text-rose-800 rounded-lg border border-rose-200">
                                {error}
                            </div>
                        )}

                        {tasks.length > 0 ? (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-sky-800 mb-3">Tasks in this list</h3>
                                <ul className="space-y-3">
                                    {tasks.map((task) => (
                                        <li
                                            key={task.id}
                                            className="flex justify-between items-start p-3 bg-white
                                            rounded-lg border border-sky-200 hover:bg-sky-50"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-sky-800">{task.title}</p>
                                                {task.description &&
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                                            </div>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="text-rose-700 hover:text-rose-900 p-1
                                                rounded-full hover:bg-rose-100 transition-colors"
                                                title="Delete task"
                                            >
                                                ✖
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="mb-6 p-4 text-center bg-sky-50 rounded-lg border border-sky-200">
                                <p className="text-gray-600">No tasks added yet</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-sky-800 mb-1">Add viewers by email</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="viewer@example.com"
                                    value={viewerEmail}
                                    onChange={(e) => setViewerEmail(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-sky-300
                                    focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <button
                                    onClick={addViewer}
                                    className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white
                                    rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {viewerEmailError && <ErrorMessage message={viewerEmailError} />}

                            {viewers.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {viewers.map((v) => (
                                        <li
                                            key={v.email}
                                            className="flex justify-between items-center bg-sky-100
                                            rounded px-3 py-1 text-sky-800"
                                        >
                                            <span>{v.email}</span>
                                            <button
                                                onClick={() => removeViewer(v.email)}
                                                className="text-rose-600 hover:text-rose-400
                                                transition-colors font-bold"
                                                title="Remove viewer"
                                            >
                                                ✖
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => navigate("/")}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg
                                border border-gray-300 hover:border-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveList}
                                disabled={tasks.length === 0 || listTitle.trim() === ""}
                                className={`px-6 py-2 text-white font-medium rounded-lg 
                                transition-colors shadow-md hover:shadow-lg ${
                                    tasks.length === 0 || listTitle.trim() === ""
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-teal-600 hover:bg-teal-700"
                                }`}
                            >
                                Save List
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateTodoList;
