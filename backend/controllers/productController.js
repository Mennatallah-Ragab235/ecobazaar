import mongoose from 'mongoose'; // مهم لـ ObjectId
import Product from "../models/product.js";
const calcRating = (reviews) => {
  if (!reviews?.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Number((sum / reviews.length).toFixed(1));
};

export const createProduct = async (req, res) => {
  try {
    const images = req.files ? req.files.map((f) => f.path) : [];
    const image = images[0] || "";

    const product = new Product({
      ...req.body,
      seller: req.user._id,
      status: "pending",
      images,
      image,
    });

    await product.save();

    res.status(201).json({
      message: "تم إضافة المنتج بنجاح وهو الآن في انتظار الموافقة",
      product,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllProductsAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "غير مصرح لك" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("seller", "fullName storeName");

    const pages = Math.ceil(total / limit);

    res.json({ data: products, page, pages, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "غير مصرح لك" });

    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "حالة غير صالحة" });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ error: "المنتج غير موجود" });

    res.json({ message: `تم تحديث الحالة إلى ${status}`, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingProducts = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "غير مصرح لك" });

    const products = await Product.find({ status: "pending" })
      .populate("seller", "fullName email storeName");

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      { ...req.body, status: "pending" },
      { new: true }
    );

    if (!product)
      return res.status(404).json({ error: "المنتج غير موجود" });

    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const rateProduct = async (req, res) => {
  try {
    const { value } = req.body;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!Array.isArray(product.ratings)) {
      product.ratings = [];
    }

    const existing = product.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existing) {
      existing.value = value;
    } else {
      product.ratings.push({
        user: req.user._id,
        value,
      });
    }

    product.numReviews = product.ratings.length;

    product.rating =
      product.ratings.reduce((acc, r) => acc + r.value, 0) /
      product.ratings.length;

    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const addReview = async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  product.reviews.push({
    user: req.user.id,
    rating: Number(rating),
    comment: comment || ""
  });

  await product.save();

  res.json(product);
};


const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name fullName'); // populate بيانات المستخدم
    
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.json(product);
  } catch (error) {
    console.error('❌ خطأ في getProductById:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};
export {getProductById  };


export const getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" })
      .populate("seller", "fullName storeName");

    const formatted = products.map(p => ({
      ...p.toObject(),
      rating:     p.rating || calcRating(p.reviews),
      numReviews: p.numReviews || p.reviews?.length || 0,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





