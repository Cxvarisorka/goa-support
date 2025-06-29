import { useEffect } from "react";
import { useNavigate } from "react-router";
import useUserMethods from "../components/hooks/useUserMethods";
import { useState } from "react";

const Messenger = () => {
    const { fetchFriends, friends } = useUserMethods();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFriends, setFilteredFriends] = useState([]);

    useEffect(() => {
        fetchFriends();
    }, []);

    useEffect(() => {
        if(friends) {
            setFilteredFriends(
                friends.filter(({ user }) => 
                    user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
        
    }, [friends, searchQuery]);

    return (
        <div className="h-screen w-full bg-white flex flex-col">
            {/* Header - Matches Navbar styling */}
            <div className="bg-green-600 text-white shadow-md">
                <div className="container mx-auto p-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">მესიჯები</h1>
                        
                        {/* Search bar for mobile */}
                        <div className="lg:hidden relative w-full max-w-xs ml-4">
                            <input
                                type="text"
                                placeholder="ძებნა..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 text-white rounded-lg border-0 focus:outline-none"
                            />
                            <svg 
                                className="absolute right-3 top-2.5 h-5 w-5 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Search bar for desktop */}
                    <div className="hidden lg:block mt-4">
                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="ძებნა კონტაქტებში..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 text-white rounded-lg border-0 focus:outline-none"
                            />
                            <svg 
                                className="absolute right-3 top-2.5 h-5 w-5 text-white" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto container mx-auto">
                {filteredFriends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">მესიჯები ვერ მოიძებნა</h3>
                        <p className="text-gray-500">{searchQuery ? "სცადეთ სხვა მოძებნა" : "დაიწყეთ ახალი საუბარი"}</p>
                    </div>
                ) : (
                    filteredFriends.map(({ user }) => (
                        <div
                            key={user._id}
                            className="flex items-center gap-4 p-4 hover:bg-green-50 transition cursor-pointer border-b border-gray-100"
                            onClick={() => navigate(`/chat/${user._id}`)}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-green-100 overflow-hidden flex items-center justify-center">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-green-600 font-semibold text-lg">
                                            {user.username?.charAt(0).toUpperCase() || "F"}
                                        </span>
                                    )}
                                </div>
                                {user.isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-gray-900 font-medium truncate">
                                        {user.fullname || user.username}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate">
                                        {user.isOnline ? (
                                            <span className="flex items-center">
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                                ონლაინ
                                            </span>
                                        ) : (
                                            "ოფლაინ"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Navigation - Matches Navbar mobile behavior */}
            <div className="lg:hidden border-t border-gray-200 p-2 bg-white sticky bottom-0">
                <div className="flex justify-around">
                    <button 
                        className="p-2 text-green-600 rounded-full"
                        onClick={() => navigate('/')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </button>
                    <button 
                        className="p-2 text-green-600 rounded-full"
                        onClick={() => navigate('/chat')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </button>
                    <button 
                        className="p-2 text-gray-500 rounded-full hover:text-green-600"
                        onClick={() => navigate('/profile')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Messenger;