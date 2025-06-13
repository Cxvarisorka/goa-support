import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuth from "../components/hooks/useAuth";
import useUserMethods from "../components/hooks/useUserMethods";

const PrivateMessenger = () => {
    const { friendId } = useParams();
    const { user } = useAuth();
    const [friend, setFriend] = useState(null);
    const {
        getMessages,
        sendMessage,
        messages,
        fetchUser,
        version
    } = useUserMethods();

    useEffect(() => {
        getMessages(friendId);
        fetchUser(friendId, setFriend);
    }, []);

    useEffect(() => {
        getMessages(friendId);
    }, [version]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = e.target.message.value;
        sendMessage(message, friendId);
        e.target.reset();
    }

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm py-4 px-6 border-b sticky top-0 z-10">
                <div className="flex items-center max-w-3xl mx-auto">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {friend?.avatar ? (
                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-600 text-lg font-medium">
                                {friend?.username?.charAt(0).toUpperCase() || "F"}
                            </span>
                        )}
                    </div>
                    <div className="ml-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {friend?.username || "Friend"}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {friend?.isOnline ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-4 space-y-2">
                    {messages?.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages?.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.senderId === user._id ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg p-3 ${
                                        msg.senderId === user._id 
                                            ? "bg-blue-500 text-white rounded-tr-none" 
                                            : "bg-gray-200 text-gray-800 rounded-tl-none"
                                    }`}
                                >
                                    {msg.senderId !== user._id && (
                                        <p className="font-medium text-xs mb-1 text-gray-700">
                                            {friend?.fullname || friend?.username || "Friend"}
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
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4 sticky bottom-0">
                <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
                    <input
                        type="text"
                        name="message"
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
        </div>
    )
}

export default PrivateMessenger;