import mongoose, { Schema } from "mongoose";


const messageSchema = new Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text : {type : String, required : true}
}, {timestamps : true})


export const Message = mongoose.model("Message", messageSchema)