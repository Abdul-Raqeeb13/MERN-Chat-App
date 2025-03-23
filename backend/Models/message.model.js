import mongoose, { Schema } from "mongoose";


const messageSchema = new Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderDelete : {type : Boolean, default : false},
    receiverDelete : {type : Boolean, default : false},
    text : {type : String, required : true},
    conversationId : {type : mongoose.Schema.Types.ObjectId, ref : "Conversation", required : true}
}, {timestamps : true})


export const Message = mongoose.model("Message", messageSchema)