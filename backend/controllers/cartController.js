import Cart from "../models/Cart.js";
import Product from "../models/product.js";

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price originalPrice image images"
    );
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product", "name price originalPrice image images");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/cart/update
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) return res.status(400).json({ error: "الكمية يجب أن تكون 1 على الأقل" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "السلة غير موجودة" });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) return res.status(404).json({ error: "المنتج غير موجود في السلة" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name price originalPrice image images");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cart/remove/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: "السلة غير موجودة" });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    await cart.populate("items.product", "name price originalPrice image images");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ message: "تم تفريغ السلة" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};