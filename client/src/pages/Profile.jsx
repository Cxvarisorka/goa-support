import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useUserMethods from "../components/hooks/useUserMethods.js";
import useAuth from "../components/hooks/useAuth.js";

const Profile = React.memo(() => {
  const { user: authUser } = useAuth();
  const { fetchUser } = useUserMethods();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUser(userId, setUser);
    } else {
      setUser(authUser);
    }
  }, [userId, authUser]);

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

        {!isOwnProfile && (
          <div className="flex flex-col gap-2">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => alert("დამატება")}
            >
              დამატება მეგობრებში
            </button>
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
});

export default Profile;
