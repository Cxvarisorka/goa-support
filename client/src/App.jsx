// კომპონენტები
import { Route, Routes } from "react-router";
import Nav from "./components/layout/Nav.jsx";
import { ToastContainer } from 'react-toastify';

// გვერდები
import Register from "./pages/Register.jsx"
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";

// კაუჭები
import useAuth from "./components/hooks/useAuth.js";

// css
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const {user} = useAuth();

  return (
    <>
      <Nav />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<ProtectedRoute navigateTo={"/profile"} canAccses={user ? false : true}><Register /></ProtectedRoute>} />
        <Route path="/login" element={<ProtectedRoute navigateTo={"/profile"} canAccses={user ? false : true}><Login /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute canAccses={user ? true : false} navigateTo={"/login"}><Profile /></ProtectedRoute>} />
      </Routes>
      
      <ToastContainer position="bottom-right" autoClose={3000}  />
    </>
  )
}

export default App;