const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Routers
const userRouter = require("./routers/user.router");

const app = express();

// Env ფაილის კონფიგურაცია
dotenv.config();

// cross-origin მოთხოვნები (მხოლოდ 5173 პრტიდან არის მოთხოვნა დაშვებულია ამჟამად)
app.use(cors({
    origin: process.env.CLIENT_URL, 
    credentials: true // allow cookies to be sent
}));

// cookies წამკითხველი
app.use(cookieParser());

// Router_ების გამოყენება
app.use("/user", userRouter);


// cluster თან დაკავშირება ჩვენი სერვერის
mongoose.connect(process.env.DB_AUTH)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT, () => {
            console.log("Server is listening on port", process.env.port)
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });
