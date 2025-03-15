import jwt from "jsonwebtoken";
import { User } from "../Models/user.model.js";
const authMiddleware = async (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    console.log(accessToken);
    

    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized. No access token found.",
        });
    }

    const decode = jwt.verify(accessToken, process.env.SECRET_KEY);
    const user = await User.findById(decode.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    req.user = user
    next()

}

export { authMiddleware }