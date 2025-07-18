import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { auth } from "../../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";


export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsub();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">

            <div className="space-x-4">
                {!user && (
                    <>
                        <NavLink
                            to="/login"
                            className="text-indigo-600 hover:underline transition"
                        >
                            LogIn
                        </NavLink>
                        <NavLink
                            to="/register"
                            className="text-indigo-600 hover:underline transition"
                        >
                            Register
                        </NavLink>
                    </>
                )}

                {user && (
                    <>
                        <NavLink
                            to="/create-todo-list"
                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                        >
                            Create To-Do List
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        >
                            LogOut
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
