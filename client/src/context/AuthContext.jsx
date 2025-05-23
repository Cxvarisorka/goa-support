// კაუჭები
import { useEffect } from "react";
import { useState, createContext } from "react";
import { useNavigate } from "react-router";

// კონტექსტი (ქსელის შექმნა)
export const AuthContext = createContext();

// სერვერის მისამართი
const API_URL = import.meta.env.VITE_API_URL;

// მნიშვნელობებისა და ფუნქციების მიმწოდებელი
export const AuthProvider = ({children}) => {
    // ავტორიზაციის შედეგად მიღებული მონაცემების შესანახად (მდგომარეობა)
    const [user, setUser] = useState(null);

    // სხვადასხვა გვერდზე მექან9იკურად გადასასვლელად
    const navigate = useNavigate();

    // როდესაც ადამიანი პირველად შემოდის საიტზე, ეგრევე ვცდილობთ ავტორიზაციას cookies გამოყენებით
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // ვაკეთებთ GET მოთხოვნას API-ის შესაბამის ენდპოინტზე
            const response = await fetch(`${API_URL}/user/profile`, {
                method: "GET", // მოთხოვნის მეთოდი - GET
                credentials: "include", // ვაგზავნით cookie
            });

            // პასუხს ვთარგმნოთ JSON_დან მნიშვნელობის ფორმატში
            const data = await response.json();

            // ვამოწმებთ პასუხს, იყო თუ არა მოთხოვნა წარმატებული
            if (!response.ok) {
                // თუ პასუხი არ არის წარმატებული, ვყროთ შეცდომა
                throw new Error(`ავტომატური ავტორიზაცია წარუმატებლად დასრულდა: ${data} ${response.status}`);
            }

            console.log("ავტორიზაცია წარმატებით დასრულდა", data);

            // წარმატებიტ დასრულების შემტხვევაში, ვანიჭებტ დაბრუნებულ მონაცემებს user გლობალურ მდგომარეობას
            setUser(data);

            // გადაგვყავს მომხმარებელი პროფილის გვერდზე
            navigate("/profile");
        } catch (err) {
            // შეცდომის შემთხვევაში ვბეჭდავთ კონსოლში ინფორმაციას
            console.error("რეგისტრაციის შეცდომა:", err);
        }
    }

    // ვქმნით ასინქრონულ რეგისტრაციის ფუნქციას, რომელიც იღებს რეგისტრაციის მონაცემებს
    const register = async (registerData) => {
        try {
            // ვაკეთებთ POST მოთხოვნას API-ის შესაბამის ენდპოინტზე
            const response = await fetch(`${API_URL}/user/register`, {
                method: "POST", // მოთხოვნის მეთოდი - POST
                headers: {
                    "Content-Type": "application/json" // ვუთითებთ, რომ მონაცემები არის JSON ფორმატში
                },
                // მონაცემებს გარდავქმნით JSON-ად body-ში
                body: JSON.stringify(registerData)
            });

            // პასუხს ვთარგმნოთ JSON_დან მნიშვნელობის ფორმატში
            const data = await response.json();

            // ვამოწმებთ პასუხს, იყო თუ არა მოთხოვნა წარმატებული
            if (!response.ok) {
                // თუ პასუხი არ არის წარმატებული, ვყროთ შეცდომა
                throw new Error(`რეგისტრაცია წარუმატებლად დასრულდა: ${data} ${response.status}`);
            }

            // აქ შეიძლება მოვახდინოთ რაიმე დამატებითი ლოგიკა რეგისტრაციის წარმატების შემთხვევაში
            console.log("რეგისტრაცია წარმატებით დასრულდა", data);

            navigate("/login");
        } catch (err) {
            // შეცდომის შემთხვევაში ვბეჭდავთ კონსოლში ინფორმაციას
            console.error("რეგისტრაციის შეცდომა:", err);
        }
    };

    // ვქმნით ასუნქრონულ ავტორიზაციის ფუნქციას, რომელიც იღებს ავტორიზაციის მონაცემებს
    const login = async (loginData) => {
        try {
            // ვაკეთებთ POST მოთხოვნას API-ის შესაბამის ენდპოინტზე
            const response = await fetch(`${API_URL}/user/login`, {
                method: "POST", // მოთხოვნის მეთოდი - POST
                headers: {
                    "Content-Type": "application/json" // ვუთითებთ, რომ მონაცემები არის JSON ფორმატში
                },
                // მონაცემებს გარდავქმნით JSON-ად body-ში
                body: JSON.stringify(loginData),
                // cookiesმისაღებად აუცილებელია
                credentials: "include"
            });

            // პასუხს ვთარგმნოთ JSON_დან მნიშვნელობის ფორმატში
            const data = await response.json();

            // ვამოწმებთ პასუხს, იყო თუ არა მოთხოვნა წარმატებული
            if (!response.ok) {
                // თუ პასუხი არ არის წარმატებული, ვყროთ შეცდომა
                throw new Error(`ავტორიზაცია წარუმატებლად დასრულდა: ${data} ${response.status}`);
            }

            console.log("ავტორიზაცია წარმატებით დასრულდა", data);

            // წარმატებიტ დასრულების შემტხვევაში, ვანიჭებტ დაბრუნებულ მონაცემებს user გლობალურ მდგომარეობას
            setUser(data);

            navigate("/profile");
        } catch (err) {
            // შეცდომის შემთხვევაში ვბეჭდავთ კონსოლში ინფორმაციას
            console.error("რეგისტრაციის შეცდომა:", err);
        }
    }

    // ვქმნით logout ფუნქციას, მომხმარებელს რომ შეეძლოს აქაუნთიდან გამოსვლა
    const logout = async () => {
        try {
            await fetch(`${API_URL}/user/logout`, {
                method: "POST",
                credentials: "include", // აუცილებელია cookie-ს გასაგზავნად
            });

            setUser(null); // წაშალე user მონაცემები frontend-იდან
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };


    return (
        <AuthContext.Provider value={{register, login, logout, user}}>
            {children}
        </AuthContext.Provider>
    )
}