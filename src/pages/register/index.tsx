import React, { useState } from "react";
import { useNavigate } from "react-router";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

import Input from "../../components/UI/atoms/Input";
import Button from "../../components/UI/atoms/Button";
import ErrorMessage from "../../components/UI/atoms/ErrorMessage";

const Register: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });

                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: userCredential.user.email,
                    displayName: name,
                    createdAt: new Date(),
                });
            }

            navigate("/");
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-nunito min-h-screen bg-sky-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-sky-200">
                    <div className="p-6 bg-sky-800 text-center">
                        <h1 className="text-2xl font-bold text-gray-200">Create Account</h1>
                        <p className="text-sky-300 mt-1">Join us today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {error && <ErrorMessage message={error} />}

                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password (min 6 characters)"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />

                        <Button type="submit" loading={loading}>
                            Register
                        </Button>

                        <div className="text-center text-sm text-gray-600 pt-2">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-teal-600 hover:text-teal-800 font-medium"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
