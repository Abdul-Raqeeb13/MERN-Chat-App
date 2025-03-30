import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Function to upload files to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"  // Detects file type automatically
        });

        console.log("✅ File Upload Success:", response.url); // Cloudinary download link
        fs.unlinkSync(localFilePath); // ✅ Remove temp file after upload
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // ✅ Remove temp file after upload

        console.log("❌ Cloudinary Upload Error:", error);
        return null;
    }
};

export { uploadOnCloudinary };
