import dotenv from "dotenv";
dotenv.config();

// ← بعد dotenv.config() مباشرة
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";


const initAdmin = async () => {
  const adminEmail = "admin@ecobazaar.com";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await User.create({
      fullName: "Admin EcoBazaar",
      email: adminEmail,
      password: "admin123", // ❗ سيبيه plain
      role: "admin",
      isVerified: true,
    });

    console.log("Admin account created: admin@ecobazaar.com / admin123");
  } else {
    console.log("Admin already exists");
  }
};



const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ecobazaarDB";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await initAdmin();
  })
  .catch(err => console.log(err));


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));