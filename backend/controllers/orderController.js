import Order from "../models/Order.js";


export const createOrder = async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user._id,
      status: "pending", // ← دايماً pending
    });
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const limit = parseInt(req.query.limit) || 0;

    let ordersQuery = Order.find({ user: req.user._id })
      .populate({
        path: "items.product",
        select: "name price images",
      })
      .sort({ createdAt: -1 });

    if (limit > 0) {
      ordersQuery = ordersQuery.limit(limit);
    }

    const orders = await ordersQuery;

    res.json(Array.isArray(orders) ? orders : []);
  } catch (err) {
    console.log("🔥 GET ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};



export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name price images");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.log("GET ORDER BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export const updateOrder = async(req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOrder = async(req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};