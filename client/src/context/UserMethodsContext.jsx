// კაუჭები
import { useEffect } from "react";
import { useState, createContext } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import useAuth from "../components/hooks/useAuth";

// კონტექსტი (ქსელის შექმნა)
export const UserMethodsContext = createContext();

// სერვერის მისამართი
const API_URL = import.meta.env.VITE_API_URL + "/api";

// მნიშვნელობებისა და ფუნქციების მიმწოდებელი
export const UserMethodsProvider = ({children}) => {
    const [notifications, setNotifications] = useState(null);
    const {version} = useAuth();

    useEffect(() => {
        getAllNotifications();
    }, [version]);

    console.log('notifications',notifications)
    
    // ვქმნით ასინქრონულ ფუნქციას, მომხმარებლების ძიებისთვის
    const searchUsers = async (query) => {
        try {
            // თუ მომხმარებელმა საძიებო ვეშლი არაფერი ჩაწერა გამოგვაქვს ერორი
            if(!query) {
                toast.error("გთხოვთ ჩაწეროთ საძიებო სიტყვა!");
                return;
            };

            // თუ გვაქვს საძიებო სიტყვა ვაგზავნით მოთხოვნას
            const response = await fetch(`${API_URL}/user/search?q=${query}`, {
                method: "GET",
                credentials: "include"
            });

            // ვთარგმნით JSON_ის ფორმატიდან ჯავასკრიპტის ობიექტის ფორმაში
            const data = await response.json();
            
            // თუ მოთხოვნა წარუმატებლად შესრულდა, გამოგვაქვს ერორი
            if(!response.ok) {
                toast.error(data);
                return;
            }

            // სხვა შემთხვევაში ვაბრუნებთ მიღებულ მასივს
            return data;

        } catch (err) {
            toast.error(err.message);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, რომლის მეშვეობითაც მივიღებთ სხვა მომხმარებლის მონაცემებს და მივიღებთ ინფორმაცის გაგზავნილია თუ არა მეგობრობის მოთხოვნა
    const fetchUser = async (userId, setUser, setFriendStatus) => {
        try {
            // ვაგზავნით GET მოთხოვნას userId-ით
            const response = await fetch(`${API_URL}/user/profile/${userId}`, {
                method: "GET",
                credentials: "include"
            });

            // ვაყალიბებთ json ფორმატში დაბრუნებულ მონაცემებს
            const data = await response.json();

            // თუ მოთხოვნა არ იყო წარმატებული, ვაჩვენოთ შეცდომის მესიჯი
            if (!response.ok) {
                toast.error(data);
                return;
            }

            // ვანიჭებთ მომხმარებლის ობიექტს setUser-ს
            setUser(data.user);

            // თუ არსებობს გაგზავნილი მეგობრობის მოთხოვნის ინფორმაცია, ვანახლებთ შესაბამის მდგომარეობას
            if (setFriendStatus && typeof data.friendStatus === "string") {
                setFriendStatus(data.friendStatus);
            }

        } catch (err) {
            // შეცდომის შემთხვევაში ვაჩვენებთ შეტყობინებას
            toast.error(err.message);
        }
    };

    // ვქმნით ასინქრონულ ფუნქციას, მეგობრებში დასამატებლად
    const addFriend = async (receiverId) => {
        try {
            // ვაგზავნით POST მოთხოვნას friend ბილიკზე
            const res = await fetch(`${API_URL}/friend/add/${receiverId}`, {
                method: "POST",
                credentials: "include"
            })

            // გავადგვყავს json_დან ჩვეულებრივ მონაცემში დაბრუნებული მნიშვნელობები
            const data = await res.json()

            // თუ რაიმე პრობლემაა, გამოვიტანოთ ერორ მესიჯი
            if (!res.ok) {
                toast.error(data);
                return;
            }

            // სხვა შემთხვევაში დავბეჭდოთ წარმატების მესიჯი
            toast.success(data);
        } catch(err) {
            toast.error(err.message);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, გამოგზავნილი მოთხოვნის უარყოფისთვის
    const rejectFriendRequest = async (senderId) => {
        try {
            const res = await fetch(`${API_URL}/friend/reject/${senderId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();

            if(!res.ok){
                toast.error(data);
                return;
            }

            // fetchUser(senderId);
            toast.success(data);
        } catch(err) {
            toast.error(err.message);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, გაგზავნილი მეგობრობის დაქანსელებისთვის
    const cancelFriendRequest = async (receiverId, setFriendStatus) => {
        try {
            const res = await fetch(`${API_URL}/friend/cancel/${receiverId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data);
                return;
            }

            setFriendStatus('none');
            toast.success(data);
        } catch(err) {
            toast.error(err.message);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, გაგზავნილი მეგობრობის დასადასტურებლად
    const acceptFriendRequest = async (senderId) => {
        try {
            const response = await fetch(`${API_URL}/friend/accept/${senderId}`, {
                method: "POST",
                credentials: "include"
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            toast.success(data);
        } catch(err) {
            toast.error(err.message);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, დადასტურებული მეგობრობის გასაუქმებლად
    const removeFriend = async (friendId) => {
        try {
            const response = await fetch(`${API_URL}/friend/remove/${friendId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            toast.success(data);
        } catch(err) {
            toast.error(err.message);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, ყველა უნახავი შეტყობინების წამოსაღებად
    const getAllNotifications = async () => {
        try {
            const response = await fetch(`${API_URL}/notification/all`, {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setNotifications(data);
        } catch(err) {
            toast.error(err);
        }
    }

    // ვქმნით ასინქრონულ ფუნქციას, კონკლრეტული შეტყობინების წამოსაღებად
    const getNotification = async (id, setNotification) => {
        try {
            const response = await fetch(`${API_URL}/notification/${id}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setNotification(data);
        } catch(err) {
            toast.error(err);
        }
    }


    // ვქმნით ასინქრონულ ფუნქციას, ყგველა შეტყობინებიოს წასაშლელად
    const deleteAllNotification = async () => {
        try {
            const response = await fetch(`${API_URL}/notification/all`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setNotifications([])

            toast.success(data);
        } catch(err) {
            toast.error(err);
        }
    }


    return (
        <UserMethodsContext.Provider value={{searchUsers, fetchUser, addFriend, rejectFriendRequest, cancelFriendRequest, acceptFriendRequest, removeFriend, notifications, setNotifications, deleteAllNotification, getNotification}}>
            {children}
        </UserMethodsContext.Provider>
    )
}