import { useContext } from "react";
import { UserMethodsContext } from "../../context/UserMethodsContext";

// ხელოვნური კაუჭი, აუთენთიქაციის კონტექსტის გამოსაყენებლად
const useUserMethods = () => {
  const context = useContext(UserMethodsContext);

  if (!context) {
    throw new Error("useAuth კაუჭი აუცილებლად უნდა გამოიყენოთ UserMethodsProvider_ის ტერიტორიაში");
  }

  return context;
};

export default useUserMethods;
