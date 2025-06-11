import { useContext, useState } from "react";
import { UserMethodsContext } from "../context/UserMethodsContext";
import { useNavigate } from "react-router";

const Notifications = () => {
    const { notifications, deleteAllNotification } = useContext(UserMethodsContext);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleDeleteAll = async () => {
        setLoading(true);
        await deleteAllNotification();
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
            <section className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-12">
                <h1 className="text-green-600 text-2xl sm:text-3xl font-bold mb-6">
                    შეტყობინებები
                </h1>

                {notifications === null ? (
                    <p className="text-gray-600">იტვირთება...</p>
                ) : notifications.length === 0 ? (
                    <p className="text-gray-500">შეტყობინებები არ არის.</p>
                ) : (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleDeleteAll}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "გთხოვთ მოითმინოთ..." : "ყველას წაშლა"}
                            </button>
                        </div>

                        <ul className="space-y-3">
                            {notifications.map((notif, idx) => (
                                <li
                                    key={notif._id || idx}
                                    className={`border border-gray-200 p-4 rounded-lg shadow-sm transition-colors ${
                                        !notif.isRead ? "bg-green-50" : "bg-white"
                                    }`}
                                >
                                    <p className="text-gray-800 text-sm sm:text-base">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notif.createdAt).toLocaleString("ka-GE")}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/notification/${notif._id}`)}
                                        className="mt-2 text-sm text-green-600 hover:underline cursor-pointer"
                                    >
                                        ნახვა
                                    </button>
                                </li>
                            ))}
                            </ul>
                    </>
                )}
            </section>
        </main>
    );
};

export default Notifications;
