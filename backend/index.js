import { app } from "./App/app.express.js";
import { connectDB } from "./Database/db.connect.js";
import dotenv from "dotenv"
dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 8000

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`app listening on port ${PORT}`);
    })
}).catch((error) => {
    console.log("Mongo DB connection failed !!", error);

})

