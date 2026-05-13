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

/* ================= ADMIN ================= */
router.get("/admin", authMiddleware, getAllProductsAdmin);
router.get("/pending", authMiddleware, getPendingProducts);

/* ================= PUBLIC ================= */
router.get("/approved", getApprovedProducts);
router.get("/seller/mine", authMiddleware, getSellerProducts);

/* ================= SEARCH (important before :id) ================= */
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

/* ================= CREATE ================= */
router.post("/", authMiddleware, upload.array("images", 6), createProduct);

/* ================= REVIEWS ================= */
router.post("/:id/review", authMiddleware, addReview);

/* ================= PRODUCT BY ID (LAST IMPORTANT) ================= */
router.get("/:id", getProductById);

/* ================= UPDATE / DELETE ================= */
router.patch("/:id/status", authMiddleware, updateProductStatus);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);


export default router;
