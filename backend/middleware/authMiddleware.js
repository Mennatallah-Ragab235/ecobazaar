import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("TOKEN RECEIVED:", token?.substring(0, 20) + "...");

    if (!token) return res.status(401).json({ error: "No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("DECODED OK:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });

    req.user = user;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.name, "|", err.message);
    console.log("SECRET USED:", JWT_SECRET);
    return res.status(401).json({ error: "Invalid token." });
  }
};