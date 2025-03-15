import { Router } from "express"
import { signup, login, createConversation, sendMessage, getAllUsers } from "../Controllers/user.controlller.js"
import { authMiddleware } from "../Middlewares/auth.middleware.js"
const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/createConversation/:id").post(authMiddleware , createConversation)
router.route("/sendMessage/:id").post(authMiddleware , sendMessage)
router.route("/getUsers").get( authMiddleware , getAllUsers)

export default router