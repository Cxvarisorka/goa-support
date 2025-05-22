import React from "react";

// კაუჭები
import useAuth from "../components/hooks/useAuth.js";

const Login = React.memo(() => {
    const {login} = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();

        const loginData = {
            email: e.target.email.value,
            password: e.target.password.value,
        }

        login(loginData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>ავტორიზაცია</h2>
            <input type="email" name="email" placeholder="იმეილი" required />
            <input type="password" name="password" placeholder="გთხოვთ შეიყვანოთ პაროლი" required />
            <button>დადასტურება</button>
        </form>
    )
});

export default Login;