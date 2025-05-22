// კაუჭები
import { useContext } from "react";
import useAuth from "../hooks/useAuth.js";

// კომპონენტები
import { Link } from "react-router";

const Nav = () => {
    const {user, logout} = useAuth();

    return (
        <header>
            <nav>
                <h1>Goa Support</h1>
                <ul>
                    <li><Link to={"/"}>მთავარი</Link></li>
                    {
                        user ? (
                            <>
                                <li onClick={logout}>გამოსვლა</li>
                                <li><Link to={"/profile"}>პროფილი</Link></li>
                            </>
                            
                        ) : (
                            <>
                                <li><Link to={"/register"}>რეგისტრაცია</Link></li>
                                <li><Link to={"/login"}>ავტორიზაცია</Link></li>
                            </>
                        )
                    }
                </ul>
                <button>მოგვწერეთ</button>
            </nav>
        </header>
    )
}

export default Nav;