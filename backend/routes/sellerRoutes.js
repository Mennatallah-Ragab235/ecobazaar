import express from 'express';
import {
  shipSellerOrder,
  getSellerStats,
    getSellerWallet,
} from '../controllers/sellerController.js';

import {getSellerOrders} from "../controllers/orderController.js";
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get("/my-orders", authMiddleware, getSellerOrders);

router.patch("/:id/ship", authMiddleware, shipSellerOrder);

router.get("/stats", authMiddleware, getSellerStats);
router.get("/wallet", authMiddleware, getSellerWallet);  // ← جديد

export default router;


