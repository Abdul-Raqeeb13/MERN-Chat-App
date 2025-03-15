import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.DATABASE_URL)
        console.log("Mongo DB databse connection");
        
    } catch (error) {
        res.status(500,()=>{
            "Error during connecting to databse"
        })
    }
}

export {connectDB}