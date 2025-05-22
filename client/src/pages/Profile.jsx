import React from "react";

// კაუჭები
import useAuth from "../components/hooks/useAuth.js";

const Profile = React.memo(() => {
    const {user} = useAuth();

    return (
        <div>
            <h2>{user.fullname}</h2>
            <p>{user.email}</p>
            <p>{user.isVerified}</p>
            <p>{user.role}</p>
        </div>
    )
});

export default Profile;