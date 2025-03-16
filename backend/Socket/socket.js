import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import router from "../Routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Apply middleware before creating the server
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/user", router);

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("User connected !!", socket.id);

    const userId = socket.handshake.query.userId;
    console.log("userid", userId);


    if (userId != "undefined" || userId != null || userId != "") {
        userSocketMap[userId] = socket.id;
        console.log("socket map", userSocketMap);

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        // io.to(userSocketMap[userId]).emit("message", "Welcome to the chat !!");

    }

    socket.on("message", (data) => {
        console.log(data);
        io.emit("message", data);
    });

    socket.on("userTyping", ({ senderId }) => {  // sendId is loginuserid the person which one is login
       
        socket.broadcast.emit("userTyping", { senderId });  // loginuserid
      });
    
      socket.on("stopTyping", ({ senderId }) => {
        socket.broadcast.emit("stopTyping", { senderId });
      });

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("User disconnected !!");
    });
});

export { app, io, server };
