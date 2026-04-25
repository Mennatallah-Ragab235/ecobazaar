import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", authMiddleware, getWishlist);
router.post("/toggle", authMiddleware, toggleWishlist);

export default router;