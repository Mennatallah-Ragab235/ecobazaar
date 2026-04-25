import axios from "axios";
import Order from "../models/Order.js";

export const createPayment = async (req, res) => {
  try {
    const {
      amount,
      items,
      shippingAddress,
      shippingMethod,
      shippingPrice,
      subtotal,
      total,
      customerData,
    } = req.body;

    // 1️⃣ إنشاء Order أولاً (IMPORTANT)
    const order = await Order.create({
      user: req.user?._id || null,
      items,
      shippingAddress,
      shippingMethod,
      shippingPrice,
      subtotal,
      total,
      paymentMethod: "card",
      status: "pending",
    });

    // 2️⃣ Auth Paymob
    const authRes = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: process.env.PAYMOB_API_KEY,
      }
    );

    const token = authRes.data.token;

    // 3️⃣ Paymob Order
    const orderRes = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: false,
        amount_cents: Math.round(amount * 100),
        currency: "EGP",
        merchant_order_id: order._id.toString(),
        items: [],
      }
    );

   // 4️⃣ Payment Key
const paymentKeyRes = await axios.post(
  "https://accept.paymob.com/api/acceptance/payment_keys",
  {
    auth_token: token,
    amount_cents: Math.round(amount * 100),
    expiration: 3600,
    order_id: orderRes.data.id,
    currency: "EGP",

    integration_id: Number(process.env.PAYMOB_INTEGRATION_ID), // 🔥 أهم سطر
redirection_url: `http://localhost:5173/order-success?orderId=${order._id}`,

    billing_data: {
      first_name: customerData?.first_name || "User",
      last_name: customerData?.last_name || "Name",
      email: customerData?.email || "test@test.com",
      phone_number: customerData?.phone_number || "01000000000",
      street: customerData?.street || "Unknown",
      city: customerData?.city || "Cairo",
      country: "EG",
      postal_code: customerData?.postal_code || "00000",
      building: "1",
      floor: "1",
      apartment: "1",
    },
  }
);



    // 5️⃣ رجّع orderId + paymentKey
   
console.log("integration:", process.env.PAYMOB_INTEGRATION_ID);
console.log("api:", process.env.PAYMOB_API_KEY);

    return res.json({
  orderId: order._id,
  paymentKey: paymentKeyRes.data.token,
  iframeId: process.env.PAYMOB_IFRAME_ID,
  success: true,
});


  } catch (err) {
    console.log("PAYMOB ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Payment failed",
      details: err.response?.data,
    });
  }
};
