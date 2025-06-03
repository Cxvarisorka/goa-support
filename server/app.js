const express = require("express");
const path = require("path");
const {Server} = require("socket.io");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Routers
const userRouter = require("./routers/user.router.js");
const friendRequestRouter = require("./routers/friendRequest.router.js");

// Env ფაილის კონფიგურაცია
dotenv.config();

// cors ცონფიგურაციის ობიექტი
const corsOption = {
    origin: process.env.CLIENT_URL, 
    credentials: true // allow cookies to be sent
};

// express hhtp სერვერი
const app = express();

app.use(cors(corsOption))

// ახალი სერვერი Socket.Io_თვის
const server = http.createServer(app);

// ახალი Socket.io სერვერი
const io = new Server(server, {
  cors: corsOption,
});

// კლიენტის ფოლდერი რომელიც უნდა მივაწოდო მომხმარებელს
// app.use(express.static(path.join(__dirname, "dist")))


// cross-origin მოთხოვნები (მხოლოდ 5173 პრტიდან არის მოთხოვნა დაშვებულია ამჟამად)
// app.use(cors({
//     origin: process.env.CLIENT_URL, 
//     credentials: true // allow cookies to be sent
// }));

// cookies წამკითხველი
app.use(cookieParser());

// for any GET request that hasn't been matched by previous routes, run this function
// app.get(/^\/(?!api).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

// საიტზე შემოსული ხალხის ინფო
const onlineUsers = new Map();

// დაკავშირების მოვლენა
io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('join', (userId) => {
        console.log(`👤 User joined with ID: ${userId}`);
        onlineUsers.set(userId, socket.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
        // Remove user from map
        for (const [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });
});


// Router_ების გამოყენება
app.use("/api/user", userRouter);
app.use('/api/friend', (req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
}, friendRequestRouter);



// cluster თან დაკავშირება ჩვენი სერვერის
mongoose.connect(process.env.DB_AUTH)
    .then(() => {
        console.log("Connected to MongoDB");
        server.listen(process.env.PORT, () => {
            console.log("Server is listening on port", process.env.port)
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

