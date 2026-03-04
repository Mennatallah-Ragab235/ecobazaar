import express from "express";
import {
  createProduct,
  getAllProductsAdmin,
  updateProductStatus,
  deleteProduct,
  getPendingProducts,
  getApprovedProducts,
  getSellerProducts,
  updateProduct,

} from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


// إنشاء منتج جديد (للبائع)
router.post("/", authMiddleware, createProduct);

// ← specific routes الأول دايماً
router.get("/admin", authMiddleware, getAllProductsAdmin);
router.get("/pending", authMiddleware, getPendingProducts);
router.get("/approved", getApprovedProducts);
router.get("/seller/mine", authMiddleware, getSellerProducts);  // ← اتنقل لفوق

// ← dynamic routes تعالي بعدين
router.patch("/:id/status", authMiddleware, updateProductStatus);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);


router.get("/", async (req, res) => {
  const search = req.query.search || "";
  try {
    const products = await Product.find({
      name: { $regex: search, $options: "i" } // i → ignore case
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;


