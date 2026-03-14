// backend/routes/authRoutes.js
import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

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
});

// ── Login ───────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password)))
  return res.status(401).json({ error: "Invalid email or password." });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
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

export default router;