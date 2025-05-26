// დამხმარე კომპონენტები
import { Link } from "react-router";

// კაუჭები
import { useState } from "react";

// კონტექსტი
import useAuth from "../hooks/useAuth.js";
import useUserMethods from "../hooks/useUserMethods.js";

const RenderSearchResults = ({results, setSearchResults}) => {
    return (
        <div className="absolute top-full mt-2 right-0 bg-white text-black rounded-md shadow-lg max-h-60 w-full overflow-y-auto z-50 border border-gray-200">
            {results.length ? (
                <>
                    {results.map((user) => (
                        <div
                            key={user._id}
                            className="px-4 py-2 hover:bg-green-100 cursor-pointer border-gray-200 border-b last:border-b-0"
                        >
                            <p className="font-medium">{user.fullname}</p>
                            <p className="text-sm text-gray-500">{user.username}</p>
                        </div>
                    ))}

                    <div className="px-4 py-2 text-red-500 hover:bg-red-100 cursor-pointer font-semibold border-t border-gray-200 text-center" onClick={() => setSearchResults(null)}>
                        გათიშვა
                    </div>

                </>
            ) : (
                <div className="px-4 py-2 text-gray-500">ვერ მოიძებნა</div>
            )}
        </div>
    )
}

// მომხმარებლის ძიება
const UserSearch = ({ onSearch, results, setSearchResults }) => {
    return (
        <div className="relative">
            <form onSubmit={onSearch} className="flex items-center gap-2">
                <div className="relative flex-1 min-w-[200px]" onClick={() => setSearchResults(null)}>
                    <input
                        type="text"
                        placeholder="მოძებნე USER..."
                        name="query"
                        required
                        className="w-full px-4 py-2 text-gray-800 rounded-lg border-0 focus:outline-none transition-all duration-200 bg-white"
                    />
                </div>
            
                <button 
                    type="submit"
                    className="bg-green-500 hover:bg-transparent hover:border text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                    <span>ძიება</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>

            {/* შედეგების დროფდაუნი */}
            {results && (
                
                   <RenderSearchResults setSearchResults={setSearchResults} results={results}/> 
                
            )}
        </div>
    );
};


// მთავარი ნავიგაციის კომპონენტი
const Nav = () => {
    const { user, logout } = useAuth();
    const { searchUsers } = useUserMethods();
    const [searchResults, setSearchResults] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        const data = await searchUsers(e.target.query.value);
        setSearchResults(data);
    };

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
                            <Link
                            to="/profile"
                            className="hover:text-green-300 transition-colors duration-200"
                            >
                            პროფილი
                            </Link>
                        </li>
                        <li>
                            <button
                            onClick={logout}
                            className="hover:text-green-300 transition-colors duration-200"
                            >
                            გამოსვლა
                            </button>
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

                {user && <UserSearch onSearch={handleSearch} setSearchResults={setSearchResults} results={searchResults} />}

                <button className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded-md transition-colors duration-200 ml-4">
                    მოგვწერეთ
                </button>
            </nav>
        </header>
    );
};

export default Nav;