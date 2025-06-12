import { useNavigate } from "react-router";
import useUserMethods from "../components/hooks/useUserMethods";

const Friends = () => {
    const navigate = useNavigate();
    const { friends, removeFriend } = useUserMethods();

    return (
        <main className="min-h-screen flex flex-col items-center justify-start py-10 px-4 bg-gray-50">
            <h1 className="text-3xl font-bold mb-8 text-green-600">მეგობრები</h1>

            {friends.length === 0 || !friends ? (
                <p className="text-center text-gray-500">არ გყავს მეგობრები</p>
            ) : (
                <div className="flex flex-col gap-6 w-full max-w-md">
                    {friends.map(({ user }) => (
                        <div
                            key={user._id}
                            className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border border-green-100"
                        >
                            <div className="w-20 h-20 mb-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-lg font-semibold text-green-700">{user.username}</h2>
                            <p className="text-sm text-gray-600">{user.email}</p>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
                                >
                                    პროფილის ნახვა
                                </button>
                                <button
                                    onClick={() => removeFriend(user._id)}
                                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl transition"
                                >
                                    წაშლა
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
};

export default Friends;
