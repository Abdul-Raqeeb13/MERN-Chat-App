import { Router } from "express"
import { signup, login, createConversation, sendMessage, getAllUsers, logout, deleteMessage } from "../Controllers/user.controlller.js"
import { authMiddleware } from "../Middlewares/auth.middleware.js"
import { upload } from "../Middlewares/multer.middleware.js"
const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/createConversation/:id").post(authMiddleware , createConversation)
router.route("/sendMessage/:id").post(authMiddleware, (req, res, next) => {
    upload.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: "Image upload error", error: err.message });
        }
        next(); // ✅ Continue to sendMessage controller
    });
}, sendMessage);
router.route("/getUsers").get( authMiddleware , getAllUsers)
router.route("/messages/:id").delete( authMiddleware , deleteMessage)

export default router