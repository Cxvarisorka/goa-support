import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuth from "../components/hooks/useAuth";
import useUserMethods from "../components/hooks/useUserMethods";

const PrivateMessenger = () => {
    const { friendId } = useParams();
    const { user } = useAuth();
    const [friend, setFriend] = useState(null);
    const [inputMessage, setInputMessage] = useState("");
    const navigate = useNavigate();
    const {
        getMessages,
        sendMessage,
        messages,
        fetchUser,
        fetchFriends,
        friends,
        version
    } = useUserMethods();


    useEffect(() => {
        if (friendId) {
            getMessages(friendId);
            fetchUser(friendId, setFriend);
        }
        fetchFriends();
    }, [friendId, version]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage, friendId);
            setInputMessage("");
        }
    };

    return (
        <div className="flex h-screen md:flex-row flex-col bg-gray-100">
            {/* Friends Sidebar */}
            <div className="md:w-1/5 border-r border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800">Messages</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {friends?.map(({user}) => (
                        <div 
                            key={user._id}
                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                friendId === user._id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => navigate(`/chat/${user._id}`)}
                        >
                            <div className="relative mr-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.profileImg ? (
                                        <img src={user.profileImg} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-600 font-medium">
                                            {user.username?.charAt(0).toUpperCase() || "F"}
                                        </span>
                                    )}
                                </div>
                                {user.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {user.fullname || user.username}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {friend ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white shadow-sm py-4 px-6 border-b sticky top-0 z-10 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
                                {friend.profileImg ? (
                                    <img src={friend.profileImg} alt={friend.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-600 text-lg font-medium">
                                        {friend.username?.charAt(0).toUpperCase() || "F"}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {friend.username || "Friend"}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {friend.isOnline ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {messages?.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages?.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex mb-3 ${msg.senderId === user._id ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                msg.senderId === user._id 
                                                    ? "bg-blue-500 text-white rounded-br-none" 
                                                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                                            }`}
                                        >
                                            {msg.senderId !== user._id && (
                                                <p className="font-medium text-xs mb-1 text-gray-700">
                                                    {friend?.fullname || friend?.username}
                                                </p>
                                            )}
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 text-right ${
                                                msg.senderId === user._id ? "text-blue-100" : "text-gray-500"
                                            }`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t p-4 sticky bottom-0">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    required
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
                            <p className="text-gray-500">Choose a friend from the sidebar to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrivateMessenger;