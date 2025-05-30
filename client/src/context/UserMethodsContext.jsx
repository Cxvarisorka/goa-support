// კაუჭები
import { useEffect } from "react";
import { useState, createContext } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

// კონტექსტი (ქსელის შექმნა)
export const UserMethodsContext = createContext();

// სერვერის მისამართი
const API_URL = import.meta.env.VITE_API_URL;

// მნიშვნელობებისა და ფუნქციების მიმწოდებელი
export const UserMethodsProvider = ({children}) => {

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

    // ვქმნით ასინქრონულ ფუნქციას, რომლის მეშვეობიოთაც მივიღებთ სხვა მომხმარებლის მონაცემებს
    const fetchUser = async (userId, setUser) => {
        try {
            // ვაგზავნით GET მოთხოვნას userId_ით
            const response = await fetch(`${API_URL}/user/profile/${userId}`, {
                method: "GET",
                credentials: "include"
            });

            // გავადგვყავს json_დან ჩვეულებრივ მონაცემში დაბრუნებული მნიშვნელობები
            const data = await response.json()

            // თუ რაიმე პრობლემაა, გამოვიტანოთ ერორ მესიჯი
            if (!response.ok) {
                toast.error(data);
                return;
            }

            // თუ პრობლემა არ არის მაშინ მივანიჭოთ დაბრუნებული მნიშვნელობა user მდგომარეობას
            setUser(data);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <UserMethodsContext.Provider value={{searchUsers, fetchUser}}>
            {children}
        </UserMethodsContext.Provider>
    )
}