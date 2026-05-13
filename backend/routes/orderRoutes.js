import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  confirmDelivery,
  shipOrder,
  payOrder,
  getAdminStats,
  getAllOrdersAdmin,
  adminUpdateOrderStatus,
  getSellerOrders,
  getPlatformEarnings,
} from "../controllers/orderController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


// ═══════════════ ADMIN ═══════════════
router.get("/admin/stats",            authMiddleware, getAdminStats);
router.get("/admin/all",              authMiddleware, getAllOrdersAdmin);
router.get("/admin/platform-earnings",authMiddleware, getPlatformEarnings);
router.patch("/admin/:id/status",     authMiddleware, adminUpdateOrderStatus);
router.delete("/:id",                 authMiddleware, deleteOrder);


// ═══════════════ SELLER ═══════════════
// جلب SubOrders البائع
router.get("/seller/my-orders",    authMiddleware, getSellerOrders);
// شحن SubOrder معين بالـ subOrderId
router.patch("/seller/:id/ship",   authMiddleware, shipOrder);


// ═══════════════ BUYER — تأكيد استلام SubOrder ═══════════════
// body: { subOrderId }
router.post("/confirm-delivery",   authMiddleware, confirmDelivery);


// ═══════════════ PAYMENT ═══════════════
router.patch("/:id/pay",           authMiddleware, payOrder);


// ═══════════════ USER ═══════════════
router.post("/",   authMiddleware, createOrder);
router.get("/",    authMiddleware, getOrders);
// ⚠️ لازم ييجي بعد الـ static routes
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id", authMiddleware, updateOrder);


export default router;