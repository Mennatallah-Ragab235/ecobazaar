import express from "express";
import { createPayment } from "../controllers/paymobController.js";
import { confirmPayment } from "../controllers/paymobController.js";
const router = express.Router();

router.post("/create-payment", createPayment);
// router.post("/confirm-payment", confirmPayment); // 🔥 دي أهم واحدة
router.patch("/confirm-payment/:orderId", confirmPayment);
export default router;
