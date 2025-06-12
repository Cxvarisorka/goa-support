// დამხმარე კომპონენტები
import { Link, useNavigate } from "react-router";
import { useState } from "react";

// კონტექსტი
import useAuth from "../hooks/useAuth.js";
import useUserMethods from "../hooks/useUserMethods.js";
import { Menu, X } from "lucide-react"; // for mobile menu icons

const RenderSearchResults = ({ results, setSearchResults }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-full mt-2 right-0 bg-white text-black rounded-md shadow-lg max-h-60 w-full overflow-y-auto z-50 border border-gray-200">
      {results.length ? (
        <>
          {results.map((user) => (
            <div
              onClick={() => navigate(`/profile/${user._id}`)}
              key={user._id}
              className="px-4 py-2 hover:bg-green-100 cursor-pointer border-gray-200 border-b last:border-b-0"
            >
              <p className="font-medium">{user.fullname}</p>
              <p className="text-sm text-gray-500">{user.username}</p>
            </div>
          ))}

          <div
            className="px-4 py-2 text-red-500 hover:bg-red-100 cursor-pointer font-semibold border-t border-gray-200 text-center"
            onClick={() => setSearchResults(null)}
          >
            გათიშვა
          </div>
        </>
      ) : (
        <div className="px-4 py-2 text-gray-500">ვერ მოიძებნა</div>
      )}
    </div>
  );
};

const UserSearch = ({ onSearch, results, setSearchResults }) => {
  return (
    <div className="relative w-full md:w-auto mt-4 md:mt-0">
      <form
        onSubmit={onSearch}
        className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full"
      >
        <div
          className="relative flex-1 min-w-[200px]"
          onClick={() => setSearchResults(null)}
        >
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
          className="bg-green-500 hover:bg-transparent hover:border hover:border-green-500 text-white hover:text-green-500 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>ძიება</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {/* Dropdown */}
      {results && (
        <RenderSearchResults
          setSearchResults={setSearchResults}
          results={results}
        />
      )}
    </div>
  );
};

const NotificationDropdown = ({ notifications, setNotifications, markAsRead, deleteAllNotification }) => {
  const navigate = useNavigate();

  const handleSeeAll = () => {
    navigate("/notifications");
  };

  const handleClickNotification = async (notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
    }

    navigate(`/notification/${notification._id}`);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden">
      <div className="p-4 font-bold border-b border-gray-300">შეტყობინებები</div>
      <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
        {notifications?.length ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                notification.isRead
                  ? "bg-white hover:bg-gray-100"
                  : "bg-green-50 hover:bg-green-100 font-medium"
              }`}
              onClick={() => handleClickNotification(notification)}
            >
              {notification.message}
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-gray-500 text-center">
            შეტყობინებები არ არის
          </div>
        )}
      </div>

      {notifications?.length > 0 && (
        <div className="flex border-t border-gray-200">
          <button
            onClick={deleteAllNotification}
            className="w-1/2 text-red-600 hover:bg-red-100 py-2 transition-colors text-sm"
          >
            წაშლა ყველა
          </button>
          <button
            onClick={handleSeeAll}
            className="w-1/2 text-blue-600 hover:bg-blue-100 py-2 transition-colors text-sm"
          >
            ნახე ყველა
          </button>
        </div>
      )}
    </div>
  );
};


const Nav = () => {
    const { user, logout } = useAuth();
    const { searchUsers, notifications, setNotifications, deleteAllNotification } = useUserMethods();
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        const data = await searchUsers(e.target.query.value);
        setSearchResults(data);
    };


    return (
        <header className="bg-green-600 text-white shadow-md">
            <nav className="container mx-auto flex flex-wrap items-center justify-between p-4">
                {/* Logo */}
                <h1 className="text-2xl font-bold">Techask</h1>

                {/* Hamburger */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Nav content */}
                <div
                    className={`w-full md:flex md:items-center md:justify-between md:space-x-6 mt-4 md:mt-0 ${
                        menuOpen ? "block" : "hidden"
                    }`}
                >
                <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
                    <li>
                        <Link
                            to="/"
                            className="hover:text-green-300 transition-colors duration-200 block"
                            onClick={() => setMenuOpen(false)}
                        >
                            მთავარი
                        </Link>
                    </li>

                    {user ? (
                        <>
                            <li>
                                <Link
                                    to="/profile"
                                    className="hover:text-green-300 transition-colors duration-200 block"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    პროფილი
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                    logout();
                                    setMenuOpen(false);
                                    }}
                                    className="hover:text-green-300 transition-colors duration-200 block"
                                >
                                    გამოსვლა
                                </button>
                            </li>
                            <li>
                              <Link to={'/friends'}>მეგობრები</Link>
                            </li>
                            <li className="relative">
                              <button
                                onClick={() => setShowNotifications((prev) => !prev)}
                                className="hover:text-green-300 transition-colors duration-200 block"
                              >
                                შეტყობინებები
                                {notifications?.some((n) => !n.isRead) && (
                                  <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                              </button>

                              {showNotifications && (
                                <NotificationDropdown
                                  notifications={notifications}
                                  setNotifications={setNotifications}
                                  deleteAllNotification={deleteAllNotification}
                                />
                              )}
                            </li>

                        </>
                    ) : (
                    <>
                        <li>
                            <Link
                                to="/register"
                                className="hover:text-green-300 transition-colors duration-200 block"
                                onClick={() => setMenuOpen(false)}
                            >
                                რეგისტრაცია
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/login"
                                className="hover:text-green-300 transition-colors duration-200 block"
                                onClick={() => setMenuOpen(false)}
                            >
                                ავტორიზაცია
                            </Link>
                        </li>
                    </>
                    )}
                </ul>

                {/* Search and Contact */}
                    <div className="flex flex-col md:flex-row gap-4 md:items-center mt-4 md:mt-0 w-full md:w-auto">
                        {user && (
                            <UserSearch
                                onSearch={handleSearch}
                                setSearchResults={setSearchResults}
                                results={searchResults}
                            />
                        )}

                        <button className="bg-green-800 hover:bg-green-700 px-4 py-2 rounded-md transition duration-200 w-full md:w-auto">
                            მოგვწერეთ
                        </button>
                    </div>
                </div>
            </nav>
            

        </header>
    );
};

export default Nav;
