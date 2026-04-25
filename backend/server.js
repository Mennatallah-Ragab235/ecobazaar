import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import User from "./models/User.js";
import paymobRoutes from "./routes/paymobRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/paymob", paymobRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);


const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/ecobazaarDB";

// 🔐 init admin
const initAdmin = async () => {
  const adminEmail = "admin@ecobazaar.com";

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      fullName: "Admin EcoBazaar",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin account created");
  } else {
    console.log("Admin already exists");
  }
};


// 🔗 connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected ✅");

    await initAdmin(); // مهم يتنفذ بعد الاتصال
  })
  .catch((err) => {
    console.log("MongoDB ERROR ❌", err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
