import { Link } from "react-router";
import useAuth from "../hooks/useAuth.js";

const Nav = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-green-600 text-white shadow-md">
            <nav className="container mx-auto flex items-center justify-between p-4">
                <h1 className="text-2xl font-bold">Goa Support</h1>

                <ul className="flex space-x-6 items-center">
                <li>
                    <Link
                    to="/"
                    className="hover:text-green-300 transition-colors duration-200"
                    >
                    მთავარი
                    </Link>
                </li>

                {user ? (
                    <>
                    <li>
                        <button
                        onClick={logout}
                        className="hover:text-green-300 transition-colors duration-200"
                        aria-label="Logout"
                        >
                        გამოსვლა
                        </button>
                    </li>
                    <li>
                        <Link
                        to="/profile"
                        className="hover:text-green-300 transition-colors duration-200"
                        >
                        პროფილი
                        </Link>
                    </li>
                    </>
                ) : (
                    <>
                    <li>
                        <Link
                        to="/register"
                        className="hover:text-green-300 transition-colors duration-200"
                        >
                        რეგისტრაცია
                        </Link>
                    </li>
                    <li>
                        <Link
                        to="/login"
                        className="hover:text-green-300 transition-colors duration-200"
                        >
                        ავტორიზაცია
                        </Link>
                    </li>
                    </>
                )}
                </ul>

                <button className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded-md transition-colors duration-200">
                მოგვწერეთ
                </button>
            </nav>
        </header>
    );
};

export default Nav;
