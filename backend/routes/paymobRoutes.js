import express from "express";
import { createPayment } from "../controllers/paymobController.js";

const router = express.Router();

router.post("/create-payment", createPayment);

export default router;
