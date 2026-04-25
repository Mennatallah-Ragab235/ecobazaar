import express from "express";
import { upload } from "../cloudinary.js";
import {
  createProduct,
  getAllProductsAdmin,
  updateProductStatus,
  deleteProduct,
  getPendingProducts,
  getApprovedProducts,
  getSellerProducts,
  updateProduct,
  getProductById,
  addReview
} from "../controllers/productController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import Product from "../models/product.js";

const router = express.Router();

/* ================= PUBLIC FIRST ================= */
router.get("/approved", getApprovedProducts);
router.get("/seller/mine", authMiddleware, getSellerProducts);

/* ================= CREATE ================= */
router.post("/", authMiddleware, upload.array("images", 6), createProduct);

/* ================= REVIEWS / RATING ================= */
router.post("/:id/review", authMiddleware, addReview);

/* ================= ADMIN ================= */
router.get("/admin", authMiddleware, getAllProductsAdmin);
router.get("/pending", authMiddleware, getPendingProducts);

/* ================= PRODUCT BY ID ================= */
router.get("/:id", getProductById);

/* ================= UPDATE / DELETE ================= */
router.patch("/:id/status", authMiddleware, updateProductStatus);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

/* ================= SEARCH ================= */
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";

    const products = await Product.find({
      name: { $regex: search, $options: "i" }
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
