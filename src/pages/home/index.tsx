import React, { useEffect, useState } from "react";

import { auth, db } from "../../firebase";
import { getDocs } from "firebase/firestore";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";

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
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "todoLists"),
            where("ownerId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const lists: TodoList[] = [];

            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();
                lists.push({
                    id: docSnap.id,
                    title: data.title,
                    ownerId: data.ownerId,
                    collaborators: data.collaborators || [],
                    tasks: [],
                });
            }

            const q2 = query(
                collection(db, "todoLists"),
                where("collaborators", "array-contains", { email: user.email })
            );

            const snapshot2 = await getDocs(q2);
            snapshot2.docs.forEach((docSnap) => {
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

            const listsWithTasks = await Promise.all(
                lists.map(async (list) => {
                    const tasksCol = collection(db, `todoLists/${list.id}/tasks`);
                    const tasksSnap = await getDocs(tasksCol);
                    const tasks: Task[] = tasksSnap.docs.map((doc) => ({
                        id: doc.id,
                        ...(doc.data() as Omit<Task, "id">),
                    }));
                    return { ...list, tasks };
                })
            );

            setTodoLists(listsWithTasks);
        });

        return () => unsubscribe();
    }, [user]);

    if (!user) return <p>Please log in</p>;

    const handleDeleteList = async (listId: string) => {
        if (!window.confirm("Are you sure you want to delete this list?")) return;

        try {
            await deleteDoc(doc(db, "todoLists", listId));
            alert("List deleted");
        } catch (e: unknown) {
            if (e instanceof Error) {
                alert(`Error deleting a list: ${e.message}`);
            } else {
                alert("Error deleting a list");
            }
        }
    };

    const toggleTaskDone =
        async (listId: string, taskId: string, done: boolean) => {
        const taskRef = doc(db, `todoLists/${listId}/tasks`, taskId);
        try {
            await updateDoc(taskRef, { done: !done });
        } catch (e: unknown) {
            if (e instanceof Error) {
                alert(`Error updating task status: ${e.message}`);
            } else {
                alert("Error updating task status");
            }
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">My to-do lists</h1>
            {todoLists.length === 0 && <p>No to-do lists are available</p>}

            {todoLists.map((list) => (
                <div key={list.id} className="mb-6 p-4 border rounded bg-white shadow">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">{list.title}</h2>
                        <button
                            onClick={() => handleDeleteList(list.id)}
                            className="text-red-600 hover:text-red-800 font-bold"
                        >
                            ✖
                        </button>
                    </div>
                    <ul>
                        {list.tasks.map((task) => (
                            <li
                                key={task.id}
                                className={`flex items-center space-x-3 py-1 ${
                                    task.done ? "line-through text-gray-500" : ""
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={() => toggleTaskDone(list.id, task.id, task.done)}
                                />
                                <div>
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Home;
