import Order from "../models/Order.js";
import Wallet from "../models/Wallet.js";

import { shipWithMock } from "../services/shipping.service.js";

export const shipSellerOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const shipRes = await shipWithMock(order);

    if (!shipRes.success) {
      return res.status(400).json({ success: false, message: shipRes.message });
    }

    order.status        = "shipped";
    order.trackingNumber = shipRes.trackingNumber;
    await order.save();

    res.json({ success: true, trackingNumber: shipRes.trackingNumber, order });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const orders = await Order.find({ "items.seller": sellerId });

    const totalOrders   = orders.length;
    const totalRevenue  = orders
      .filter(o => o.status === "delivered")
      .reduce((s, o) => s + (o.total || 0), 0);
    const shippedOrders = orders.filter(o => o.status === "shipped").length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    res.json({ success: true, data: { totalOrders, totalRevenue, shippedOrders, pendingOrders } });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSellerWallet = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // جيب أو انشئ الـ wallet
    let wallet = await Wallet.findOne({ user: sellerId });
    if (!wallet) {
      wallet = await Wallet.create({
        user: sellerId,
        availableBalance: 0,
        pendingBalance:   0,
      });
    }

    res.json({
      availableBalance: wallet.availableBalance,
      pendingBalance:   wallet.pendingBalance,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};