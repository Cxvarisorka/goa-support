import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import useUserMethods from "../components/hooks/useUserMethods.js";
import useAuth from "../components/hooks/useAuth.js";

const Avatar = ({ user, size = 'profile', uploadProfileImage, isOwnProfile = false }) => {
  const [isHover, setIsHover] = useState(false);

  if (!user) return null;
  
  const colors = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-red-600', 'bg-yellow-600'];
  
  const color = colors[user.fullname?.charCodeAt(0) % colors.length] || colors[0];

  const handleMouseOver = () => {
    setIsHover(true);
  }

  const handleMouseOut = () => {
    setIsHover(false);
  }

  

  return (
    <div 
      className={`relative ${size === 'profile' ? 'w-24 h-24 md:w-32 md:h-32' : 'w-10 h-10'}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {/* Display profile image if available */}
      {user.profileImg ? (
        <img 
          src={user.profileImg} 
          alt={user.fullname || user.username}
          className={`${size === 'profile' ? 'w-full h-full' : 'w-10 h-10'} rounded-full border-4 border-white shadow-lg`}
        />
      ) : (
        /* Display initials avatar if no profile image */
        <div className={`${color} ${size === 'profile' ? 'w-full h-full text-3xl' : 'w-10 h-10'} rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg`}>
          {(user.fullname || user.username)?.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

// FriendActionButtons Component
const FriendActionButtons = ({ isOwnProfile, friendStatus, user, addFriend, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, navigate }) => {
  if (isOwnProfile) return null;

  return (
    <div className="mt-4 md:mt-0 flex space-x-2">
      {friendStatus === "none" && (
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          onClick={async () => {
            await addFriend(user._id);
            setFriendStatus("request_sent");
          }}
        >
          Add Friend
        </button>
      )}

      {friendStatus === "request_sent" && (
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
          onClick={async () => {
            await cancelFriendRequest(user._id);
            setFriendStatus("none");
          }}
        >
          Cancel Request
        </button>
      )}

      {friendStatus === "request_received" && (
        <>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onClick={async () => {
              await acceptFriendRequest(user._id);
              setFriendStatus("friends");
            }}
          >
            Accept
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={async () => {
              await rejectFriendRequest(user._id);
              setFriendStatus("none");
            }}
          >
            Reject
          </button>
        </>
      )}

      {friendStatus === "friends" && (
        <>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onClick={() => navigate(`/chat/${user._id}`)}
          >
            Message
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={async () => {
              const confirmed = window.confirm("Are you sure you want to remove this friend?");
              if (confirmed) {
                await removeFriend(user._id);
                setFriendStatus("none");
              }
            }}
          >
            Remove
          </button>
        </>
      )}
    </div>
  );
};

// QuestionForm Component
const QuestionForm = ({ authUser, handleSubmit }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-green-100">
      <div className="flex items-start space-x-3">
        <Avatar user={authUser} size="small" />
        <form className="flex-1 flex flex-col gap-3" onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="text" name="title" placeholder="შეკითხვის სათაური" required  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-georgia"/>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-georgia"
            rows="3"
            name="description"
            placeholder="შეკითხვის აღწერა"
            required
          />
          <input type="file" name="image"  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-georgia"/>
          <div className="flex justify-end mt-2">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Answers = ({ answers, onAnswerSubmit, currentUser }) => {
  const [newAnswer, setNewAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    onAnswerSubmit(newAnswer);
    setNewAnswer('');
  };

  console.log(answers)

  return (
    <div className="mt-10 pl-2">
      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="mb-4 flex items-start gap-3">
        <Avatar user={currentUser} size="small" />
        <div className="flex-1">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-georgia"
            rows="2"
            placeholder="დაწერე პასუხი..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            required
          />
          <div className="flex justify-end mt-2">
            <button 
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
            >
              პასუხის დამატება
            </button>
          </div>
        </div>
      </form>

      {/* Answers List */}
      <div className="space-y-3">
        {answers.length > 0 ? (
          answers.map((answer) => (
            <div key={answer?._id} className="bg-green-50 rounded-lg p-3 flex items-start gap-3">
              <Avatar user={{ username: answer?.fullname }} size="small" />
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <Link to={`/profile/${answer?.author}`} className="font-medium text-sm">{answer?.fullname}</Link>
                  <span className="mx-2 text-gray-400">·</span>
                  <span className="text-gray-500 text-xs">
                    {new Date(answer?.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 text-sm">{answer?.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            ჯერჯერობით არანაირი პასუხი არ არის.
          </div>
        )}
      </div>
    </div>
  );
};

// QuestionItem Component (also uses the Answers component)
const QuestionItem = ({ question, user, addAnswer, deleteQuestion, getAnswers, authUser, toggleLike }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [likes, setLikes] = useState(question.likes);

  const handleLikeClick = async () => {
    const newLikes = await toggleLike(question._id);
    if (newLikes) setLikes(newLikes);
  }

  const handleAnswerSubmit = async (answerText) => {
    const answer = await addAnswer(question._id, answerText);
    if(answer) setAnswers([...answers, answer]);
    
  };

  useEffect(() => {
    (async () => {
      const data = await getAnswers(question._id);
      setAnswers(data)
    })();
  }, []);

  const toggleImage = () => {
    setShowFullImage(!showFullImage);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    setShowDropdown(false);
    // Add your edit logic here
    console.log("Edit question");
  };

  const handleDelete = () => {
    setShowDropdown(false);
    deleteQuestion(question._id);
  };

  // Close dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-green-100 relative">
      {/* Dropdown menu */}
      <div className="absolute top-3 right-3">
        <button 
          onClick={toggleDropdown}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
            <div className="py-1">
              <button
                onClick={handleEdit}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                შეცვლა
              </button>
              <button
                onClick={handleDelete}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                წაშლა
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start space-x-3">
        <Avatar user={user} size="small" />
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-bold text-gray-800 hover:underline cursor-pointer">{user.fullname}</h3>
            <span className="mx-1 text-gray-500">·</span>
            <span className="text-gray-500 text-sm">
              {new Date(question.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-gray-800 font-semibold text-lg">{question.title}</p>
          <p className="text-gray-700 mt-2">{question.description}</p>
          
          {question.image && (
            <div className="mt-3">
              <img
                src={question.image}
                alt="question image"
                className={`rounded-lg cursor-pointer max-h-72 w-auto`}
                onClick={toggleImage}
              />
              {showFullImage && (
                <div 
                  className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                  onClick={toggleImage}
                >
                  <div className="relative max-w-full max-h-full">
                    <img
                      src={question.image}
                      alt="question image fullscreen"
                      className="max-h-[90vh] max-w-full object-contain"
                    />
                    <button 
                      className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70"
                      onClick={toggleImage}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
            <button 
              className={`flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 ${
                likes?.includes(authUser._id) ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
              }`}
              onClick={handleLikeClick}
            >

              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>დალაიქება ({likes?.length || 0})</span>
            </button>
            <button 
              className="flex items-center space-x-1 text-gray-500 hover:text-green-600 px-2 py-1 rounded-md hover:bg-gray-100"
              onClick={() => setShowAnswers(!showAnswers)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <span>{showAnswers ? 'დამალე პასუხები' : `პასუხები (${answers.length || 0})`}</span>
            </button>
          </div>
          
          {showAnswers && (
            <Answers 
              answers={answers} 
              onAnswerSubmit={handleAnswerSubmit} 
              currentUser={authUser} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
// FriendsList Component
const FriendsList = ({ friends, navigate }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">მეგობრები</h2>
        <p className="text-sm text-gray-500 mt-1">{friends?.length} მეგობარი</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {friends.map(({ user }) => (
          <div 
            key={user._id}
            className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            <div className="flex-shrink-0">
              <Avatar user={user} size="small" />
            </div>
            
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">{user.fullname || user.username}</h3>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
            
            <div className="ml-auto">
              <button 
                className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/chat/${user._id}`);
                }}
              >
                მესიჯი
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {friends.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500">თქვენ არ გყავთ მეგობრები</p>
        </div>
      )}
    </div>
  );
};

// Add this component near your other components (QuestionForm, Answers, etc.)
const ChangeProfileImage = ({ uploadProfileImage, currentUser }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData(e.target);
      
      await uploadProfileImage(formData);
      
      // Reset after successful upload
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to update profile image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-green-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">პროფილის სურათის შეცვლა</h2>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-medium text-gray-700 mb-2">მიმდინარე სურათი</h3>
          <Avatar user={currentUser} size="profile" />
        </div>
        
        {preview && (
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-gray-700 mb-2">ახალი სურათი</h3>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            აირჩიეთ ახალი სურათი
          </label>
          <input
            type="file"
            ref={fileInputRef}
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className={`px-4 py-2 rounded-md text-white ${selectedFile ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {isUploading ? 'ატვირთვა...' : 'ატვირთვა'}
        </button>
      </form>
    </div>
  );
};

const OldProfileImages = ({ images = [] }) => {
  if (!images.length) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-green-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4">ძველი პროფილის ფოტოები</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {images.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            alt={`Old profile ${index + 1}`}
            className="w-30 h-30 object-cover"
          />
        ))}
      </div>
    </div>
  );
};

// Main Profile Component
const Profile = () => {
  const { user: authUser, version } = useAuth();
  const {
    fetchUser,
    addFriend,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    friends,
    fetchFriends,
    addQuestion,
    questions,
    setQuestions,
    getQuestions,
    deleteQuestion,
    addAnswer,
    getAnswers,
    uploadProfileImage,
    toggleLike
  } = useUserMethods();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState("none");
  const [activeTab, setActiveTab] = useState("questions");

  useEffect(() => {
    if (userId) {
      fetchUser(userId, setUser, setFriendStatus);
      getQuestions(userId)
    } else {
      setUser(authUser);
      getQuestions(authUser._id)
    }
  }, [userId, authUser, version]);

  useEffect(() => {
    if (user) {
      fetchFriends(user);
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addQuestion(formData);
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <p className="text-green-700 text-lg font-georgia">მომხმარებელი არ არის ამოცნობილი.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <p className="text-green-700 text-lg font-georgia">იტვირთება...</p>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === authUser._id;

  return (
    <div className="min-h-screen bg-green-50 font-georgia pt-10">
      {/* Profile Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex flex-col md:flex-row items-start md:items-end pb-6">
          {/* Profile Picture */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            <Avatar uploadProfileImage={uploadProfileImage} isOwnProfile={isOwnProfile} user={user} size="profile" />
          </div>

          {/* Profile Info */}
          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {user.fullname}
              </h1>
              {user.isVerified && (
                <span className="ml-2 text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-gray-600">@{user.username}</p>
            
            {/* Friend Status Display */}
            {!isOwnProfile && (
              <p className="text-green-700 mt-1">
                {friendStatus === "friends" && "Friends"}
                {friendStatus === "request_sent" && "Friend request sent"}
                {friendStatus === "request_received" && "Wants to be friends"}
              </p>
            )}
          </div>

          <FriendActionButtons 
            isOwnProfile={isOwnProfile}
            friendStatus={friendStatus}
            user={user}
            addFriend={addFriend}
            cancelFriendRequest={cancelFriendRequest}
            acceptFriendRequest={acceptFriendRequest}
            rejectFriendRequest={rejectFriendRequest}
            removeFriend={removeFriend}
            navigate={navigate}
            setFriendStatus={setFriendStatus}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-green-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("questions")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "questions" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              შეკითხვები
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "friends" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              მეგობრები
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("change-profile-img")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "change-profile-img" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                პროფილის სურათის შეცვლა
              </button>
            )}
          </nav>
        </div>

      {/* Main Content */}
      <div className="container mx-auto  py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - About */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="bg-white rounded-lg shadow p-4 border border-green-100">
              <h2 className="text-lg font-bold text-gray-800 mb-3">მომხმარებლის აღწერა</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-gray-800">@{user.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-2/3 space-y-4">
            {/* Questions Feed */}
            {activeTab === "questions" && (
              <>
                {isOwnProfile && <QuestionForm authUser={authUser} handleSubmit={handleSubmit} />}
                
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionItem key={question._id} toggleLike={toggleLike} deleteQuestion={deleteQuestion} addAnswer={addAnswer} getAnswers={getAnswers} authUser={authUser} question={question} user={user} />
                  ))}
                </div>
              </>
            )}

            {/* Friends List */}
            {activeTab === "friends" && <FriendsList friends={friends} navigate={navigate} />}
            
            {/* Change Profile Image */}
            {activeTab === "change-profile-img" && isOwnProfile && (
              <>
                <ChangeProfileImage uploadProfileImage={uploadProfileImage} currentUser={authUser} />
                <OldProfileImages images={authUser.images}/>
              </>
              
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Profile;