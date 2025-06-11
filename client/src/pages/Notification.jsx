import { useParams, useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";

import useUserMethods from "../components/hooks/useUserMethods";

const Notification = () => {
  const { id } = useParams();
  const {getNotification} = useUserMethods();
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    getNotification(id, setNotification);
  }, [id]);

  if(!notification) {
    return <p>Wait</p>
  }


  return (
    <main className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-green-600 hover:underline"
      >
        უკან
      </button>

      <article className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
        <h1 className="text-xl font-semibold mb-2">შეტყობინება</h1>
        <Link to={`/profile/${notification.from._id}`} className="text-lg font-bold mb-2 underline">From - {notification.from.fullname}</Link>
        <p className="text-gray-800 mb-4">{notification.message}</p>
        <p className="text-xs text-gray-500">
          {new Date(notification.createdAt).toLocaleString("ka-GE")}
        </p>
        {!notification.isRead && (
          <p className="mt-2 text-sm text-green-600 font-medium">ახალი შეტყობინება</p>
        )}
      </article>
    </main>
  );
};

export default Notification;
