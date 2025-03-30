import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" }, // ✅ Make text optional by setting a default empty string
    imgLink: { type: String, default: null }, // ✅ Make imgLink optional
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderDelete: { type: Boolean, default: false },
    receiverDelete: { type: Boolean, default: false },
}, { timestamps: true });


export const Message = mongoose.model("Message", messageSchema)