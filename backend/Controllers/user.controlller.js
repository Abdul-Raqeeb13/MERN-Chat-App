import mongoose from "mongoose";
import { User } from "../Models/user.model.js";
import { Conversation } from "../Models/conversation.model.js";
import { Message } from "../Models/message.model.js";
import { getReceiverSocketId, io } from "../Socket/socket.js";


const signup = async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const userExist = await User.findOne({ email })
    if (userExist) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }

    const newUser = await User.create({ username, email, password });

    if (!newUser) {
        return res.status(500).json({
            success: false,
            message: "User creation failed. Please try again.",
        });
    }

    return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
    });

}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const userExist = await User.findOne({ email });

    if (!userExist) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    const passwordCorrect = await userExist.isPasswordCorrect(password);

    if (!passwordCorrect) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    const accessToken = await userExist.generateAccessToken();
    if (!accessToken) {
        return res.status(500).json({
            success: false,
            message: "Token generation failed",
        });
    }

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ Secure in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ Adjust for cross-origin
        path: "/", // ✅ Ensures cookie is accessible globally
    };

    res.cookie("accessToken", accessToken, cookieOptions);

    res.status(200).json({
        success: true,
        message: "Login successful",
        userData: userExist,
        token: accessToken
    });
};

const logout = async(req, res)=>{
    res.clearCookie("accessToken"); // Clears auth token if stored in cookies
  
  return res.status(200).json({ message: "Logout successful" });
}
const createConversation = async (req, res) => {
    try {
        const senderId = new mongoose.Types.ObjectId(req.user._id);
        const receiverId = new mongoose.Types.ObjectId(req.params.id);

        // 🔍 Fetch the conversation along with messages using aggregation
        let room = await Conversation.aggregate([
            {
                $match: {
                    participants: { $all: [senderId, receiverId] }
                }
            },
            {
                $lookup: {
                    from: "messages", // Ensure correct collection name
                    localField: "messagesId",
                    foreignField: "_id",
                    as: "messagesId"
                }
            }
        ]);
        
        

        // If no conversation exists, create a new one
        if (room.length === 0) {
            const newRoom = new Conversation({
                participants: [senderId, receiverId],
                messagesId: []
            });

            await newRoom.save();

            return res.status(200).json({
                success: true,
                message: "New conversation created",
                room: newRoom
            });
        }

        // ✅ Return only the `messagesId` array if conversation exists
        return res.status(200).json({
            success: true,
            messages: room[0].messagesId || []
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create conversation",
            error: error.message
        });
    }
};



const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id; // Extract sender ID from middleware
        const receiverId = req.params.id; // Extract receiver ID from request params
        const { text } = req.body; // Extract text from request body

        if (!senderId || !receiverId || !text) {
            return res.status(400).json({
                success: false,
                message: "Sender ID, Receiver ID, and message text are required.",
            });
        }

        // ✅ Find or create a conversation
        let room = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!room) {
            room = new Conversation({
                participants: [senderId, receiverId],
                messagesId: []
            });

            await room.save();
        }

        // ✅ Create a new message document
        const message = new Message({
            senderId: new mongoose.Types.ObjectId(senderId),
            receiverId: new mongoose.Types.ObjectId(receiverId),
            text
        });

        await message.save(); // Save message to MongoDB

        // ✅ Add message to the conversation
        room.messagesId.push(message._id);
        await room.save();

        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message)
        }

        return res.status(200).json({
            success: true,
            message: "Message sent successfully.",
            data: message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send message.",
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    const users = await User.find({}).select("-password");
    return res.status(200).json({
        success: true,
        users
    }); 


}


export { signup, login, createConversation, sendMessage, getAllUsers , logout}