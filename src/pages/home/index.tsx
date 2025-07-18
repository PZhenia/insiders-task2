import React, { useEffect, useState } from "react";
import { NavLink } from "react-router";

import { auth, db } from "../../firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDocs,
} from "firebase/firestore";

import TaskItem from "./components/TaskItem";
import CollaboratorBadge from "./components/CollaboratorBadge";
import EmptyState from "./components/EmptyState";

type Task = {
    id: string;
    title: string;
    description: string;
    done: boolean;
};

type TodoList = {
    id: string;
    title: string;
    ownerId: string;
    collaborators: { email: string }[];
    tasks: Task[];
};

const Home: React.FC = () => {
    const [todoLists, setTodoLists] = useState<TodoList[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        let unsubTasks: (() => void)[] = [];

        const subscribeToTasks = (list: TodoList) => {
            const tasksCol = collection(db, `todoLists/${list.id}/tasks`);
            return onSnapshot(tasksCol, (tasksSnap) => {
                const updatedTasks: Task[] = tasksSnap.docs.map((taskDoc) => ({
                    id: taskDoc.id,
                    ...(taskDoc.data() as Omit<Task, "id">),
                }));

                setTodoLists((prev) => {
                    const newLists = [...prev];
                    const existingIndex = newLists.findIndex((l) => l.id === list.id);

                    if (existingIndex !== -1) {
                        newLists[existingIndex] = {
                            ...newLists[existingIndex],
                            tasks: updatedTasks,
                        };
                    } else {
                        newLists.push({ ...list, tasks: updatedTasks });
                    }

                    return newLists;
                });
            });
        };

        const loadLists = async () => {
            const lists: TodoList[] = [];

            const ownerQuery = query(
                collection(db, "todoLists"),
                where("ownerId", "==", user.uid)
            );
            const ownerSnap = await getDocs(ownerQuery);

            ownerSnap.forEach((docSnap) => {
                const data = docSnap.data();
                lists.push({
                    id: docSnap.id,
                    title: data.title,
                    ownerId: data.ownerId,
                    collaborators: data.collaborators || [],
                    tasks: [],
                });
            });

            const collaboratorQuery = query(
                collection(db, "todoLists"),
                where("collaborators", "array-contains", { email: user.email })
            );
            const collabSnap = await getDocs(collaboratorQuery);

            collabSnap.forEach((docSnap) => {
                const data = docSnap.data();
                if (!lists.find((l) => l.id === docSnap.id)) {
                    lists.push({
                        id: docSnap.id,
                        title: data.title,
                        ownerId: data.ownerId,
                        collaborators: data.collaborators || [],
                        tasks: [],
                    });
                }
            });

            setTodoLists(lists);
            unsubTasks = lists.map((list) => subscribeToTasks(list));
        };

        loadLists();
        return () => {
            unsubTasks.forEach((unsub) => unsub());
        };
    }, [user]);

    if (authLoading) return null;

    if (!user)
        return (
            <div className="flex justify-center items-center min-h-screen bg-sky-50">
                <p className="text-lg text-sky-800 font-medium">Please log in</p>
            </div>
        );

    const handleDeleteList = async (listId: string) => {
        if (!window.confirm("Are you sure you want to delete this list?")) return;
        try {
            await deleteDoc(doc(db, "todoLists", listId));
            setTodoLists(prev => prev.filter(list => list.id !== listId));
        } catch (e: unknown) {
            alert(`Error deleting a list: ${(e as Error).message}`);
        }
    };

    const handleDeleteTask = async (listId: string, taskId: string) => {
        try {
            await deleteDoc(doc(db, `todoLists/${listId}/tasks`, taskId));

            setTodoLists(prev => {
                return prev
                    .map(list => {
                        if (list.id === listId) {
                            const updatedTasks = list.tasks.filter(task => task.id !== taskId);
                            return { ...list, tasks: updatedTasks };
                        }
                        return list;
                    })
                    .filter(list => list.tasks.length > 0);
            });

            const tasksSnapshot = await getDocs(collection(db, `todoLists/${listId}/tasks`));
            if (tasksSnapshot.empty) {
                await deleteDoc(doc(db, "todoLists", listId));
                setTodoLists(prev => prev.filter(list => list.id !== listId));
            }
        } catch (e: unknown) {
            alert(`Error deleting task: ${(e as Error).message}`);
        }
    };

    const toggleTaskDone = async (
        listId: string,
        taskId: string,
        done: boolean
    ) => {
        const taskRef = doc(db, `todoLists/${listId}/tasks`, taskId);
        try {
            await updateDoc(taskRef, { done: !done });
        } catch (e: unknown) {
            alert(`Error updating task: ${(e as Error).message}`);
        }
    };

    return (
        <div className="font-nunito min-h-full p-6 bg-sky-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-sky-800">My to-do lists</h1>

                {todoLists.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {todoLists.map((list) => (
                            <div
                                key={list.id}
                                className="bg-white p-5 rounded-lg shadow-md border border-sky-200
                                hover:shadow-lg transition-shadow"
                            >
                                <div className="flex justify-between items-center mb-3 border-b border-sky-100 pb-3">
                                    <h2 className="text-xl font-semibold text-sky-800">
                                        {list.title}
                                    </h2>
                                    <button
                                        onClick={() => handleDeleteList(list.id)}
                                        className="text-rose-800 hover:text-rose-600
                                        transition-colors p-1 rounded-full hover:bg-rose-50"
                                        title="Delete list"
                                    >
                                        ✖
                                    </button>
                                </div>

                                {list.collaborators.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 mb-1">Collaborators:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {list.collaborators.map((collab, index) => (
                                                <CollaboratorBadge key={index} email={collab.email} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <ul className="space-y-2">
                                    {list.tasks.length === 0 ? (
                                        <li className="text-sm text-gray-500 italic">No tasks yet</li>
                                    ) : (
                                        list.tasks.map((task) => (
                                            <TaskItem
                                                key={task.id}
                                                id={task.id}
                                                title={task.title}
                                                description={task.description}
                                                done={task.done}
                                                onToggleDone={() =>
                                                    toggleTaskDone(list.id, task.id, task.done)
                                                }
                                                onDelete={() => handleDeleteTask(list.id, task.id)}
                                            />
                                        ))
                                    )}
                                </ul>

                                {user.uid === list.ownerId && (
                                    <NavLink
                                        to={`/edit-todo-list/${list.id}`}
                                        className="mt-3 inline-block text-sm text-teal-600
                                        hover:text-teal-800 hover:underline"
                                    >
                                        Edit list ✎
                                    </NavLink>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
