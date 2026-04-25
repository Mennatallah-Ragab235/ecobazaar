import Wishlist from "../models/Wishlist.js";

// جيب المفضلة
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate("products");
    res.json(wishlist?.products || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// أضف أو شيل منتج
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId]
      });
      return res.json({ added: true, wishlist });
    }

    const exists = wishlist.products.includes(productId);

    if (exists) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId
      );
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.json({ added: !exists, wishlist });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};