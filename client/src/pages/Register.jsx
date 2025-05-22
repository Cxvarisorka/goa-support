import React from "react";

// კაუჭები
import useAuth from "../components/hooks/useAuth.js";

const Register = React.memo(() => {
    const {register} = useAuth()

    const handleSubmit = (e) => {
        e.preventDefault();

        const registrationData = {
            email: e.target.email.value,
            password: e.target.password.value,
            fullname: e.target.fullname.value
        }

        register(registrationData);
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>რეგისტრაცია</h2>
            <input type="email" name="email" placeholder="იმეილი" required />
            <input type="text" name="fullname" placeholder="სახელი/გვარი" required />
            <input
                type="password"
                name="password"
                minLength={6}
                maxLength={15}
                title="პაროლი უნდა შეიცავდეს 6-15 სიმბოლოს"
                placeholder="გთხოვთ შეიყვანოთ პაროლი"
                required
            />
            <button>დადასტურება</button>
        </form>
    )
});

export default Register;