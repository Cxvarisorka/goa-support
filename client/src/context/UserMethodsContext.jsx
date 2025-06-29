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
    const {user, checkAuth} = useAuth();
    const [notifications, setNotifications] = useState(null);
    const [friends, setFriends] = useState(null);
    const [messages, setMessages] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [chatWith, setChatWith] = useState(null);

    const {version} = useAuth();

    console.log(friends)

    useEffect(() => {
        if(user) {
            getAllNotifications();
            fetchFriends(); 
            getQuestions(user._id); 
        }
        
    }, [version, user]);
    
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

    // ყველა მ,ეგობრის ინფოს წამოღება
    const fetchFriends = async (person = user) => {
        try {
            const idArr = person.friends;

            if(!idArr) return;

            const responses = await Promise.all(
                idArr.map(id => fetch(`${API_URL}/user/profile/${id}`, {credentials: 'include'}))
            );

            const data = await Promise.all(
                responses.map(res => res.json())
            );
            
            setFriends(data);
        } catch (err) {
            toast.error("Failed to fetch friends: " + err.message);
        }
    };

    // ყველა მესიჯის წამოღება კონკრეტული მეგობრის ჩათიდან
    const getMessages = async (friendId) => {
        try {
            const response = await fetch(`${API_URL}/message/chat/${friendId}`, {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setMessages(data);
        } catch (err) {
            toast.error("Failed to fetch friends: " + err.message);
        }
    }

    // მესიჯის გაგზავნა
    const sendMessage = async (message, friendId) => {
        try {
            const response = await fetch(`${API_URL}/message/${friendId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify({text: message})
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setMessages([...messages, data]);
        } catch (err) {
            toast.error("Failed to fetch friends: " + err.message);
        }
    }

    // შეკიტხვის დამატება
    const addQuestion = async (formData) => {
        try {

            const response = await fetch(`${API_URL}/question/`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            })

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setQuestions([...questions, data]);
            toast.success('შეკიტხვა წარმატებით დაემატა!');
        } catch(err) {
            toast.error(err);
        }
    }

    // ლაიქის დამატება/მოხსნა
    const toggleLike = async (questionId) => {
        try {
            const res = await fetch(`${API_URL}/question/like/${questionId}`, {
                method: 'PUT',
                credentials: 'include'
            });

            const data = await res.json();

            if(!res.ok) {
              toast.error(data);
              return;  
            }
            
            return data;
        } catch(err) {
            toast.error(err.message);
        }
    }

    // შეკიტხვის წაშლა
    const deleteQuestion = async (questionId) => {
        try {
            const response = await fetch(`${API_URL}/question/${questionId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if(!response.ok) {
                toast.error(data);
                return;
            }

            setQuestions(questions.filter(question => question._id != questionId));
            
            toast.success(data);
        } catch(err) {
            toast.error(err);
        }
    }

    // შეკიტხვების წამოღება
    const getQuestions = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/question/${userId}`, {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data);
                return;
            }

            setQuestions(data);
        } catch(err) {
            handleError(err);
        }
    };

    // პასუხების წამოღება
    const getAnswers = async (questionId) => {
        try {
            const response = await fetch(`${API_URL}/answer/question/${questionId}`, {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data);
                return;
            }

            return data;
        } catch(err) {
            handleError(err);
        }
    }
 
    // პასუხის დამატება
    const addAnswer = async (questionId, text) => {
        try {
            const response = await fetch(`${API_URL}/answer/${questionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ description: text })
            });

            const data = await response.json();

            console.log(data)

            if (!response.ok) {
                toast.error(data);
                return;
            }

            // ახალი პასუხის დამატება კითხვებზე (თუ საჭიროა)
            // setQuestions(prev => [...prev, data]);

            toast.success('პასუხი დაემატა!');

            return data;
        } catch (err) {
            toast.error(err.message);
        }
    };

    // პროფილის ფოტოს შეცვლა
    const uploadProfileImage = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/user/change-profile-img`, {
                credentials: 'include',
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data);
                return;
            }

            checkAuth();

            toast.success(data);
        } catch(err) {
            toast.error(err);
        }
    }



    return (
        <UserMethodsContext.Provider value={{searchUsers, fetchUser, addFriend, rejectFriendRequest, cancelFriendRequest, acceptFriendRequest, removeFriend, notifications, setNotifications, deleteAllNotification, getNotification, friends, fetchFriends, getMessages, sendMessage, messages, version, addQuestion, deleteQuestion, setQuestions, questions, getQuestions, addAnswer, getAnswers, uploadProfileImage, toggleLike}}>
            {children}
        </UserMethodsContext.Provider>
    )
}