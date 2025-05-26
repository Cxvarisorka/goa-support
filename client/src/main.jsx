import { BrowserRouter } from "react-router";
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";
import './tailwind.css'
import { UserMethodsProvider } from "./context/UserMethodsContext.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <UserMethodsProvider>
        <App />
      </UserMethodsProvider>
    </AuthProvider>
  </BrowserRouter>,
)
