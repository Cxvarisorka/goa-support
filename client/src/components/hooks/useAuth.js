import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// ხელოვნური კაუჭი, აუთენთიქაციის კონტექსტის გამოსაყენებლად
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth კაუჭი აუცილებლად უნდა გამოიყენოთ AuthProvider_ის ტერიტორიაში");
  }

  return context;
};

export default useAuth;
