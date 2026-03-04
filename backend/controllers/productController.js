import Product from "../models/product.js";

// إنشاء منتج جديد
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      seller: req.user._id,
      status: "pending", 
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
    if (req.user.role !== "admin") return res.status(403).json({ error: "غير مصرح لك" });

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

// تحديث حالة المنتج (approve / reject)
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== "admin") return res.status(403).json({ error: "غير مصرح لك" });

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "حالة غير صالحة" });

    const product = await Product.findByIdAndUpdate(id, { status }, { new: true });
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });

    res.json({ message: `تم تحديث حالة المنتج إلى ${status}`, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// حذف المنتج
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// جلب كل المنتجات المعلقة فقط (لأدمن)
export const getPendingProducts = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "غير مصرح لك" });

    const products = await Product.find({ status: "pending" })
      .populate("seller", "fullName email storeName");

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جلب كل المنتجات الموافق عليها
export const getApprovedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "approved" })
      .populate("seller", "fullName storeName");
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
      { ...req.body, status: "pending" }, // بيرجع للمراجعة بعد التعديل
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "المنتج غير موجود" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

