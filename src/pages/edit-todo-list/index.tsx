import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";

import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import Button from "../../components/UI/atoms/Button";
import Input from "../../components/UI/atoms/Input";
import ErrorMessage from "../../components/UI/atoms/ErrorMessage";

type Task = {
    id: string;
    title: string;
    description: string;
    done: boolean;
};

type TaskErrors = {
    title?: string;
    description?: string;
};

const EditTodoList: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [listTitle, setListTitle] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [errors, setErrors] = useState<{ listTitle?: string; taskErrors: TaskErrors[] }>({
        taskErrors: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setLoading(true);
            const listRef = doc(db, "todoLists", id);
            const listSnap = await getDoc(listRef);

            if (listSnap.exists()) {
                const data = listSnap.data();
                setListTitle(data.title);

                const tasksSnap = await getDocs(collection(db, `todoLists/${id}/tasks`));
                const loadedTasks: Task[] = tasksSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Task, "id">),
                }));
                setTasks(loadedTasks);
                setErrors({ taskErrors: new Array(loadedTasks.length).fill({}) });
            } else {
                alert("List not found");
                navigate("/");
            }
            setLoading(false);
        };

        loadData();
    }, [id, navigate]);

    const validate = () => {
        const listTitleError = listTitle.trim().length < 1 ? "List title is required." : undefined;

        const taskErrors = tasks.map((task) => {
            const taskError: TaskErrors = {};
            if (task.title.trim().length < 1) {
                taskError.title = "Task title is required.";
            }
            if (task.description.trim().length < 3) {
                taskError.description = "Description must be at least 3 characters.";
            }
            return taskError;
        });

        const hasErrors = !!listTitleError || taskErrors.some((err) => err.title || err.description);

        setErrors({ listTitle: listTitleError, taskErrors });

        return !hasErrors;
    };

    const handleSave = async () => {
        if (!id || !validate()) return;

        try {
            const listRef = doc(db, "todoLists", id);
            await updateDoc(listRef, { title: listTitle });

            const updateTasks = tasks.map((task) =>
                updateDoc(doc(db, `todoLists/${id}/tasks`, task.id), {
                    title: task.title,
                    description: task.description,
                })
            );

            await Promise.all(updateTasks);

            navigate("/");
        } catch (e) {
            console.error(e);
            alert("Error saving changes");
        }
    };

    if (loading) return <p className="p-6 text-sky-800">Loading...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6 font-nunito bg-sky-50 min-h-screen">
            <h1 className="text-2xl font-bold text-sky-800 mb-4">Edit To-Do List</h1>

            <div className="mb-6">
                <Input
                    label="List Title"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    placeholder="Enter list title"
                />
                {errors.listTitle && <ErrorMessage message={errors.listTitle} />}
            </div>

            <h2 className="text-xl font-semibold text-sky-700 mb-3">Tasks</h2>

            <div className="space-y-4">
                {tasks.map((task, index) => (
                    <div
                        key={task.id}
                        className="bg-white p-4 rounded-lg shadow border border-sky-100"
                    >
                        <Input
                            label="Task Title"
                            value={task.title}
                            onChange={(e) =>
                                setTasks((prev) => {
                                    const updated = [...prev];
                                    updated[index] = { ...updated[index], title: e.target.value };
                                    return updated;
                                })
                            }
                            placeholder="Enter task title"
                        />
                        {errors.taskErrors[index]?.title && (
                            <ErrorMessage message={errors.taskErrors[index]?.title} />
                        )}

                        <label className="block text-sm font-medium text-sky-700 mb-1 mt-3">
                            Description
                        </label>
                        <textarea
                            value={task.description}
                            onChange={(e) =>
                                setTasks((prev) => {
                                    const updated = [...prev];
                                    updated[index] = { ...updated[index], description: e.target.value };
                                    return updated;
                                })
                            }
                            className="w-full px-3 py-2 border border-sky-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                            placeholder="Enter task description"
                        />
                        {errors.taskErrors[index]?.description && (
                            <ErrorMessage message={errors.taskErrors[index]?.description} />
                        )}
                    </div>
                ))}
            </div>

            <Button onClick={handleSave} className="mt-6">
                Save Changes
            </Button>
        </div>
    );
};

export default EditTodoList;
