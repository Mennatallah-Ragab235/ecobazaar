// backend/routes/authRoutes.js
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });



router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ── Register Buyer ─────────────────────────────
router.post("/register/buyer", async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !phone || !password)
      return res.status(400).json({ error: "All fields are required." });

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered." });

    const user = await User.create({ fullName, email, phone, password, role: "buyer" });
    const token = signToken(user);

    res.status(201).json({
      message: "Buyer account created successfully.",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Register Seller ────────────────────────────
router.post("/register/seller", async (req, res) => {
  try {
    const {
      fullName, email, phone, password, confirmPassword,
      storeName, storeDescription, productCategory,
      commercialRegNumber, nationalIdNumber, taxNumber, website,
      nationalIdImage, // ✅ استخرجها هنا
    } = req.body;

    if (!fullName || !email || !phone || !password || !storeName)
      return res.status(400).json({ error: "Required fields are missing." });

    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered." });

    const user = await User.create({
      fullName, email, phone, password, role: "seller",
      storeName, storeDescription, productCategory,
      commercialRegNumber, nationalIdNumber, taxNumber, website,
      nationalIdImage, // ✅ احفظها في الـ DB
    });

    const token = signToken(user);
    res.status(201).json({
      message: "Seller account created successfully.",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // ✅ تم حذف السطرين اللي كانوا هنا بعد الـ res.json (كانوا ميتنفذوش)
});

// ── Login ───────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // 🔴 لازم تتحقق الأول
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── Get Me ──────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
});


// ── Update Profile ──────────────────────────────
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, address, city, zip } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phone, address, city, zip },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Change Password ─────────────────────────────
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ error: "كلمة السر الحالية غلط" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "تم تغيير كلمة السر بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;