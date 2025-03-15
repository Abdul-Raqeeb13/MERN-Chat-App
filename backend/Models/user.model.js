import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    username: { type: String, required: true, },
    email: { type: String, required: true },
    password: { type: String, require: true }
})

// this run before saving the document in database
userSchema.pre("save", async function (next) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// compare the user given passwrod with hass passowrd stored in DB
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        { id: this._id }, process.env.SECRET_KEY,{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};


export const User = mongoose.model("User", userSchema)