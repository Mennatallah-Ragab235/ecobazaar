import axios from "axios";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Wallet from "../models/Wallet.js";
import Withdrawal from "../models/Withdrawal.js";


let cachedToken = null;
let tokenTime = 0;

const toNumber = (v) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};


const getPaymobToken = async () => {
  const now = Date.now();

  // لو التوكن لسه صالح (ساعة تقريبًا)
  if (cachedToken && now - tokenTime < 50 * 60 * 1000) {
    return cachedToken;
  }

  const res = await axios.post(
    "https://accept.paymob.com/api/auth/tokens",
    {
      api_key: process.env.PAYMOB_API_KEY,
    }
  );

  cachedToken = res.data.token;
  tokenTime = now;

  return cachedToken;
};



export const createPayment = async (req, res) => {
  try {
    const {
      amount,
      items = [],
      shippingAddress,
      shippingMethod,
      shippingPrice,
      subtotal,
      total,
      customerData,
      orderId, // 🔥 خليه هنا مش فوق
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!items.length) {
      return res.status(400).json({ message: "No items provided" });
    }

    const amountNum = Number(amount);
    const totalNum = Number(total);

    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // =========================
    // CHECK EXISTING ORDER (SAFE)
    // =========================
    let order = null;

    if (orderId) {
      order = await Order.findById(orderId);
    }

    // لو مفيش order → اعمل واحد
    if (!order) {
      order = await Order.create({
        user: req.user?._id,
        items,
        shippingAddress,
        shippingMethod,
        shippingPrice: Number(shippingPrice || 0),
        subtotal: Number(subtotal),
        total: totalNum,
        paymentMethod: "card",
        status: "pending",
        paymentStatus: "pending",
        isPaid: false,
      });
    }

    // =========================
    // PREVENT DUPLICATE PAYMENT
    // =========================
    if (order.paymentStatus === "processing") {
      return res.status(409).json({
        success: false,
        message: "Payment already in progress",
      });
    }

    // =========================
    // LOCK ORDER
    // =========================
    order.paymentStatus = "processing";
    await order.save();

    // =========================
    // PAYMOB AUTH
    // =========================
    const token = await getPaymobToken();

    // =========================
    // PAYMOB ORDER
    // =========================
    const paymobOrderRes = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: Math.round(amountNum * 100),
        currency: "EGP",
        merchant_order_id: order._id.toString(),
        items: [
          {
            name: "Order",
            amount_cents: Math.round(amountNum * 100),
            quantity: 1,
          },
        ],
      }
    );

    // =========================
    // PAYMENT KEY
    // =========================
    const paymentKeyRes = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: Math.round(amountNum * 100),
        expiration: 3600,
        order_id: paymobOrderRes.data.id,
        currency: "EGP",
        integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),

        redirection_url: `http://localhost:5173/order-success?orderId=${order._id}`,

        billing_data: {
          first_name: customerData?.first_name || "User",
          last_name: customerData?.last_name || "Name",
          email: customerData?.email || "test@test.com",
          phone_number: customerData?.phone_number || "01000000000",
          street: "Unknown",
          city: "Cairo",
          country: "EG",
          postal_code: "00000",
          building: "1",
          floor: "1",
          apartment: "1",
        },
      }
    );

    // =========================
    // SAVE PAYMOB DATA
    // =========================
    order.paymobOrderId = paymobOrderRes.data.id;
    order.paymentKey = paymentKeyRes.data.token;
    await order.save();

    // =========================
    // RESPONSE
    // =========================
    return res.json({
      success: true,
      orderId: order._id,
      paymentKey: paymentKeyRes.data.token,
      iframeId: process.env.PAYMOB_IFRAME_ID,
    });

  } catch (err) {
    console.log("PAYMOB ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Payment failed",
    });
  }
};

export const confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.escrowStatus === "released") {
      return res.status(400).json({ message: "Already released" });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Not paid yet" });
    }

    const PLATFORM_PERCENT = 0.1;

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      let wallet = await Wallet.findOne({ user: product.seller });
      if (!wallet) continue;

      const itemTotal = item.price * item.quantity;
      const sellerAmount = itemTotal * (1 - PLATFORM_PERCENT);

      wallet.pendingBalance -= sellerAmount;
      wallet.availableBalance += sellerAmount;

      await wallet.save();
    }

    order.escrowStatus = "released";
    order.status = "delivered";

    await order.save();

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const withdraw = async (req, res) => {
  try {
    const userId = req.user._id;
    const amount = toNumber(req.body.amount);

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet.availableBalance -= amount;
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      status: "pending",
    });

    return res.json({
      success: true,
      withdrawal,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

async function addToPendingWallet(order) {
  const PLATFORM_PERCENT = 0.1;

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    let wallet = await Wallet.findOne({ user: product.seller });

    if (!wallet) {
      wallet = await Wallet.create({ user: product.seller });
    }

    const itemTotal = item.price * item.quantity;
    const sellerAmount = itemTotal * (1 - PLATFORM_PERCENT);

    wallet.pendingBalance += sellerAmount;

    await wallet.save();
  }
}

export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 already paid
    if (order.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "Already paid",
        order,
      });
    }

    // 🔒 منع الدفع غير المكتمل
    if (order.paymentStatus === "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment not started yet",
      });
    }

    // =========================
    // CONFIRM PAYMENT
    // =========================
    order.paymentStatus = "paid";
    order.status = "confirmed";   // 🔥 أهم تعديل
    order.isPaid = true;
    order.escrowStatus = "holding";

    await order.save();

    // 🔥 امسح السلة هنا
await Cart.findOneAndUpdate(
  { user: order.user },
  { $set: { items: [] } }
);
    return res.json({
      success: true,
      message: "Payment confirmed successfully",
      order,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};