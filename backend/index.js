import { connectDB } from "./Database/db.connect.js";
import dotenv from "dotenv";
import { server } from "./Socket/socket.js";

dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
    });
}).catch((error) => {
    console.log("MongoDB connection failed !!", error);
});
