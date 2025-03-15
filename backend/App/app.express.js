import express from "express"
import router from "../Routes/user.route.js"
import cookieParser from "cookie-parser";
import cors from "cors"
const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json()); 
app.use(express.urlencoded({ extended: true})); 
app.use(cookieParser())

app.use("/user",router)

export {app}
