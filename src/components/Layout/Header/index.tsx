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
        <header className="font-nunito bg-sky-800 shadow-md p-4 flex justify-between items-center">
            <div className="space-x-4">
                {!user && (
                    <>
                        <NavLink
                            to="/login"
                            className="text-gray-200 hover:text-white px-3 py-1.5 rounded-md
                            hover:bg-sky-700 transition-colors duration-200"
                        >
                            Log In
                        </NavLink>
                        <NavLink
                            to="/register"
                            className="text-gray-200 hover:text-white px-3 py-1.5 rounded-md
                            hover:bg-sky-700 transition-colors duration-200"
                        >
                            Register
                        </NavLink>
                    </>
                )}

                {user && (
                    <>
                        <NavLink
                            to="/create-todo-list"
                            className="px-4 py-2 bg-teal-500 text-white rounded-md
                            hover:bg-teal-600 transition-colors duration-200 shadow hover:shadow-md"
                        >
                            Create To-Do List
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-rose-800 text-gray-200 rounded-md
                            hover:bg-rose-700 transition-colors duration-200 ml-2 shadow hover:shadow-md"
                        >
                            LogOut
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
