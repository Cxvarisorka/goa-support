import React from "react";
import useAuth from "../components/hooks/useAuth.js";

const Register = React.memo(() => {
    const { register } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();

        const registrationData = {
        email: e.target.email.value,
        password: e.target.password.value,
        fullname: e.target.fullname.value,
        };

        register(registrationData);
    };

    return (
        <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded-lg p-8 max-w-md w-full"
            >
                <h2 className="text-green-700 text-3xl font-bold mb-6 text-center">
                    რეგისტრაცია
                </h2>

                <input
                    type="email"
                    name="email"
                    placeholder="იმეილი"
                    required
                    className="w-full mb-4 px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                    type="text"
                    name="fullname"
                    placeholder="სახელი/გვარი"
                    required
                    className="w-full mb-4 px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <input
                    type="password"
                    name="password"
                    minLength={6}
                    maxLength={15}
                    title="პაროლი უნდა შეიცავდეს 6-15 სიმბოლოს"
                    placeholder="გთხოვთ შეიყვანოთ პაროლი"
                    required
                    className="w-full mb-6 px-4 py-3 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-md transition-colors duration-300"
                >
                    დადასტურება
                </button>
            </form>
        </main>
    );
});

export default Register;
