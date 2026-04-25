import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder
} from "../controllers/orderController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 لازم تسجيل دخول
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id", authMiddleware, updateOrder);
router.delete("/:id", authMiddleware, deleteOrder);

export default router;
