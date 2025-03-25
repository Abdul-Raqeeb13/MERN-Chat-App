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
        methods: ["GET", "POST", "DELETE"]
    }
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId]
}

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("User connected !!", socket.id);

    const userId = socket.handshake.query.userId;


    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

    }

    socket.on("message", (data) => {
        console.log(data);
        io.emit("message", data);
    });

    socket.on("userTyping", ({ senderId, receiverId }) => {

        // Emit only to the receiver, NOT to everyone
        const receiverSocketId = userSocketMap[receiverId]; // Get the receiver's socket ID

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { senderId });
        }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId]; // Get the receiver's socket ID
        console.log(receiverSocketId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("userTyping", { senderId });
        }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", { senderId }); // ✅ Correct event
        }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
