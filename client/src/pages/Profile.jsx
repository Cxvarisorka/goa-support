import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useUserMethods from "../components/hooks/useUserMethods.js";
import useAuth from "../components/hooks/useAuth.js";

const Profile = () => {
  const { user: authUser, version } = useAuth();
  const {
    fetchUser,
    addFriend,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  } = useUserMethods();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState("none"); // "none", "request_sent", "request_received", "friends"

  useEffect(() => {
      

    if (userId) {
      fetchUser(userId, setUser, setFriendStatus);
    } else {
      setUser(authUser);
    }
  }, [userId, authUser, version]);

 

  if (!authUser) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <p className="text-green-700 text-lg">მომხმარებელი არ არის ავტორიზებული</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <p className="text-green-700 text-lg">იტვირთება...</p>
      </main>
    );
  }


  // ვამოწმებთ საკუთარი პროფილია თუ არა
  const isOwnProfile = !userId || userId === authUser._id;

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <section className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h2 className="text-green-700 text-3xl font-bold mb-4">{user.fullname}</h2>

        <p className="mb-2 text-gray-700">
          <span className="font-semibold">იმეილი:</span> {user.email}
        </p>

        <p className="mb-2 text-gray-700">
          <span className="font-semibold">აქაუნთის სახელი:</span> {user.username}
        </p>

        <p className="mb-2 text-gray-700">
          <span className="font-semibold">ვერიფიცირებული:</span> {user.isVerified ? "დიახ" : "არა"}
        </p>

        <p className="mb-4 text-gray-700">
          <span className="font-semibold">როლი:</span> {user.role}
        </p>

        {/* ვამოწმებთ არის თუ არა საკუთარი პროფილი */}
        {!isOwnProfile && (
          <div className="flex flex-col gap-2">

            {friendStatus === "none" && (
              <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={async () => {
                  await addFriend(user._id);
                  setFriendStatus("request_sent");
                }}
              >
                დამატება მეგობრებში
              </button>
            )}

            {friendStatus === "request_sent" && (
              <button
                className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                onClick={async () => {
                  await cancelFriendRequest(user._id, setFriendStatus);
                  setFriendStatus("none");
                }}
              >
                მეგობრობის მოთხოვნის გაუქმება
              </button>
            )}

            {friendStatus === "request_received" && (
              <>
                <button
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  onClick={async () => {
                    await acceptFriendRequest(user._id);
                    setFriendStatus("friends");
                  }}
                >
                  მოთხოვნის დადასტურება
                </button>
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  onClick={async () => {
                    await rejectFriendRequest(user._id);
                    setFriendStatus("none");
                  }}
                >
                  მოთხოვნის უარყოფა
                </button>
              </>
            )}

            {friendStatus === "friends" && (
              <>
                <button
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  onClick={() => navigate(`/messages/${user._id}`)}
                >
                  მესიჯის გაგზავნა
                </button>

                <button
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                  onClick={async () => {
                    const confirmed = window.confirm("დარწმუნებული ხარ, რომ გინდა წაშალო მეგობრებიდან?");
                    if (confirmed) {
                      await removeFriend(user._id); // ეს ფუნქცია უნდა არსებობდეს useUserMethods-ში
                      setFriendStatus("none");
                    }
                  }}
                >
                  მეგობრობის გაუქმება
                </button>
              </>
            )}


            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              onClick={() => alert("დაბლოკვა")}
            >
              დაბლოკვა
            </button>

            <button
              className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
              onClick={() => navigate("/profile")}
            >
              ჩემს პროფილზე დაბრუნება
            </button>
          </div>
        )}
      </section>
    </main>
  );
};


export default Profile;
