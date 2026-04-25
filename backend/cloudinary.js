import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

console.log("Cloudinary config:", { cloud_name, api_key: api_key ? "✅" : "❌" });

cloudinary.config({ cloud_name, api_key, api_secret });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
  folder: "ecobazaar",
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ 
    width: 400,        
    height: 400,       
    crop: "limit",
    quality: 50,       
    format: "webp",    
  }],
},
});

export const upload = multer({ storage });
export default cloudinary;