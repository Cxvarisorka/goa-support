import React from "react";
import useAuth from "../components/hooks/useAuth.js";

const Profile = React.memo(() => {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <p className="text-green-700 text-lg">მომხმარებელი არ არის ავტორიზებული</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <section className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
            <h2 className="text-green-700 text-3xl font-bold mb-4">{user.fullname}</h2>

            <p className="mb-2 text-gray-700">
                <span className="font-semibold">იმეილი:</span> {user.email}
            </p>

            <p className="mb-2 text-gray-700">
                <span className="font-semibold">ვერიფიცირებული:</span> {user.isVerified ? "დიახ" : "არა"}
            </p>

            <p className="text-gray-700">
                <span className="font-semibold">როლი:</span> {user.role}
            </p>
        </section>
    </main>
  );
});

export default Profile;
