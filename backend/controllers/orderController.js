import Order    from "../models/Order.js";
import SubOrder from "../models/SubOrder.js";
import Product  from "../models/Product.js";
import Wallet   from "../models/Wallet.js";
import User     from "../models/User.js";

const PLATFORM_FEE_RATE = 0.10; // 10%

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet)
    wallet = await Wallet.create({ user: userId, availableBalance: 0, pendingBalance: 0 });
  return wallet;
};

const getAdminWallet = async () => {
  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("Admin user not found");
  return getOrCreateWallet(admin._id);
};

const deriveMainStatus = (subStatuses) => {
  if (subStatuses.every(s => s === "delivered"))                       return "delivered";
  if (subStatuses.every(s => s === "shipped" || s === "delivered"))    return "shipped";
  if (subStatuses.some(s  => s === "shipped"))                         return "partially_shipped";
  if (subStatuses.every(s => s === "cancelled"))                       return "cancelled";
  if (subStatuses.some(s  => s === "processing"))                      return "processing";
  return "pending";
};



export const getSellerWallet = async (req, res) => {
  const sellerId = req.user._id;

  // ⏳ Pending (محجوز)
  const pendingAgg = await SubOrder.aggregate([
    {
      $match: {
        seller: sellerId,
        escrowStatus: "holding",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$netAmount" },
      },
    },
  ]);

  // 💵 Available (متحرر)
  const availableAgg = await SubOrder.aggregate([
    {
      $match: {
        seller: sellerId,
        escrowStatus: "released",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$netAmount" },
      },
    },
  ]);

  const pendingBalance = pendingAgg[0]?.total || 0;
  const availableBalance = availableAgg[0]?.total || 0;

  const totalEarned = pendingBalance + availableBalance;

  res.json({
    pendingBalance,
    availableBalance,
    totalEarned,
  });
};

export const createOrder = async (req, res) => {
  try {
    const buyerId = req.user._id || req.user.id;

    // ── جلب بيانات المنتجات ─────────────────────────────────────────────────
    const enrichedItems = await Promise.all(
      req.body.items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        return {
          product:  product._id,
          seller:   product.seller,
          quantity: item.quantity,
          price:    product.price,
        };
      })
    );

    // ── حساب الإجماليات ─────────────────────────────────────────────────────
    const subtotal      = enrichedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingPrice = req.body.shippingPrice || 0;
    const total         = subtotal + shippingPrice;

    // ── إنشاء MainOrder ─────────────────────────────────────────────────────
    const mainOrder = await Order.create({
      user:            buyerId,
      items:           enrichedItems,
      shippingAddress: req.body.shippingAddress,
      shippingMethod:  req.body.shippingMethod,
      shippingPrice,
      paymentMethod:   req.body.paymentMethod,
      subtotal,
      total,
      status:       "pending",
      escrowStatus: "holding",
    });

    // ── تجميع items لكل بائع ────────────────────────────────────────────────
    const sellerMap = {};
    enrichedItems.forEach((item) => {
      const sid = item.seller.toString();
      if (!sellerMap[sid]) sellerMap[sid] = [];
      sellerMap[sid].push(item);
    });

    // ── إنشاء SubOrder لكل بائع + تحديث الـ Wallet ─────────────────────────
    const subOrderIds = [];

    for (const sellerId in sellerMap) {
      const items         = sellerMap[sellerId];
      const sellerSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

      const sub = await SubOrder.create({
        mainOrder:    mainOrder._id,
        seller:       sellerId,
        buyer:        buyerId,
        items:        items.map(i => ({ product: i.product, quantity: i.quantity, price: i.price })),
        subtotal:     sellerSubtotal,
        status:       "pending",
        escrowStatus: "holding",
        paymentStatus: "pending",
      });

      subOrderIds.push(sub._id);

    
    }

    // ── ربط SubOrders بالـ MainOrder ────────────────────────────────────────
    mainOrder.subOrders = subOrderIds;
    await mainOrder.save();

    const populated = await Order.findById(mainOrder._id).populate("subOrders");
    res.status(201).json(populated);

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
export const getOrders = async (req, res) => {
  try {
    const limit   = parseInt(req.query.limit) || 0;
    const buyerId = req.user._id || req.user.id;

    let query = Order.find({ user: buyerId })
      .populate({
        path:     "subOrders",
        populate: [
          { path: "items.product", select: "name price images" },
          { path: "seller",        select: "storeName fullName" },
        ],
      })
      .sort({ createdAt: -1 });

    if (limit > 0) query = query.limit(limit);

    const orders = await query;
    res.json(Array.isArray(orders) ? orders : []);

  } catch (err) {
    console.error("🔥 GET ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path:     "subOrders",
        populate: [
          { path: "items.product", select: "name price images" },
          { path: "seller",        select: "storeName fullName" },
        ],
      });

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

   const subOrders = await SubOrder.find({ seller: sellerId })
  .populate("buyer", "fullName phone")
  .populate({
    path: "items.product",
    select: "name price images seller",
    populate: {
      path: "seller",
      select: "storeName fullName",
    },
  })
  .populate({
    path: "mainOrder",
    select:
      "shippingAddress shippingMethod paymentMethod total createdAt",
  })
  .sort({ createdAt: -1 });

res.json(subOrders);

} catch (err) {
  res.status(500).json({ message: err.message });
}
};
export const shipOrder = async (req, res) => {
  try {
    const sellerId   = req.user._id.toString();
    const subOrderId = req.params.id;

    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder)
      return res.status(404).json({ message: "SubOrder not found" });

    if (subOrder.seller.toString() !== sellerId)
      return res.status(403).json({ message: "مش بتاعك الأوردر ده" });

    if (subOrder.status === "shipped" || subOrder.status === "delivered")
      return res.status(400).json({ message: "تم شحن الأوردر ده بالفعل" });

    // ── تحديث الـ SubOrder ──────────────────────────────────────────────────
    subOrder.status         = "shipped";
    subOrder.trackingNumber = `PST-${Math.floor(100000 + Math.random() * 900000)}`;
    await subOrder.save();

    // ── تحديث status الـ MainOrder ──────────────────────────────────────────
    const allSubs    = await SubOrder.find({ mainOrder: subOrder.mainOrder });
    const mainStatus = deriveMainStatus(allSubs.map(s => s.status));
    await Order.findByIdAndUpdate(subOrder.mainOrder, { status: mainStatus });

    res.json({ success: true, subOrder, mainOrderStatus: mainStatus });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.status        = "processing";
    await order.save();

    await SubOrder.updateMany(
      { mainOrder: order._id },
      { paymentStatus: "paid", status: "processing" }
    );

    const subOrders = await SubOrder.find({ mainOrder: order._id });

for (const subOrder of subOrders) {

  const wallet = await getOrCreateWallet(subOrder.seller);

  const grossAmount = subOrder.subtotal;
const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100;
const netAmount = Math.round((grossAmount - platformFee) * 100) / 100;

wallet.pendingBalance += subOrder.subtotal;

  await wallet.save();
}
await Cart.findOneAndUpdate(
  { user: order.user },
  {
    $set: {
      items: [],
      totalPrice: 0
    }
  }
);
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "غير مصرح لك" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });

    await SubOrder.deleteMany({ mainOrder: order._id });
    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: "تم حذف الطلب بنجاح", deletedOrderId: req.params.id });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmDelivery = async (req, res) => {
  try {
    const { subOrderId } = req.body;
    const buyerId = (req.user._id || req.user.id).toString();

    const subOrder = await SubOrder.findById(subOrderId);
    if (!subOrder) return res.status(404).json({ message: "SubOrder not found" });
    if (subOrder.buyer.toString() !== buyerId)
      return res.status(403).json({ message: "Not your order" });
    if (subOrder.escrowStatus === "released")
      return res.json({ message: "Already released" });

    const grossAmount  = subOrder.subtotal;
    const platformFee  = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100;  // 10%
    const netAmount    = Math.round((grossAmount - platformFee) * 100) / 100;       // 90%

    // ── seller wallet ──────────────────────────────────────────────
    const sellerWallet = await getOrCreateWallet(subOrder.seller);
    sellerWallet.pendingBalance   = Math.max(0, sellerWallet.pendingBalance - grossAmount);
    sellerWallet.availableBalance += netAmount;
    sellerWallet.totalEarned      = (sellerWallet.totalEarned  || 0) + netAmount;
    sellerWallet.totalFees        = (sellerWallet.totalFees    || 0) + platformFee;
    sellerWallet.transactions.push({
      type:     "sale",
      amount:   grossAmount,
      fee:      platformFee,
      net:      netAmount,
      subOrder: subOrder._id,
      description: "بيع — خصم عمولة 10%",
    });
    await sellerWallet.save();

    // ── admin wallet ── ✅ ده كان ناقص ─────────────────────────────
    const adminWallet = await getAdminWallet();
    adminWallet.availableBalance += platformFee;
    adminWallet.totalEarned       = (adminWallet.totalEarned || 0) + platformFee;
    adminWallet.transactions.push({
      type:     "platform_fee",
      amount:   platformFee,
      fee:      0,
      net:      platformFee,
      subOrder: subOrder._id,
      description: `عمولة 10% من بيع بتاع ${subOrder.seller}`,
    });
    await adminWallet.save();

    // ── SubOrder ───────────────────────────────────────────────────
    subOrder.platformFee   = platformFee;
    subOrder.netAmount     = netAmount;
    subOrder.fundsReleased = true;
    subOrder.escrowStatus  = "released";
    subOrder.paymentStatus = "paid";
    subOrder.status        = "delivered";
    await subOrder.save();

    // ── MainOrder ──────────────────────────────────────────────────
    const allSubs      = await SubOrder.find({ mainOrder: subOrder.mainOrder });
    const mainStatus   = deriveMainStatus(allSubs.map(s => s.status));
    const allReleased  = allSubs.every(s => s.escrowStatus === "released");
    const someReleased = allSubs.some(s  => s.escrowStatus === "released");

    await Order.findByIdAndUpdate(subOrder.mainOrder, {
      status:       mainStatus,
      escrowStatus: allReleased ? "released" : someReleased ? "partially_released" : "holding",
    });

    res.json({ success: true, subOrder });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "غير مصرح" });

    // ── أرباح المنصة المحصّلة فعلاً (من SubOrders المتسلّمة) ───────
    const earningsAgg = await SubOrder.aggregate([
      { $match: { escrowStatus: "released", fundsReleased: true } },
      { $group: { _id: null,
          platformEarnings: { $sum: "$platformFee" },
          totalSales:       { $sum: "$subtotal" },
          sellerEarnings:   { $sum: "$netAmount" },
      }},
    ]);
    const earned = earningsAgg[0] || { platformEarnings: 0, totalSales: 0, sellerEarnings: 0 };

    // ── أرباح معلقة (holding) = 10% من subtotal الـ SubOrders اللي لسه ما اتسلمتش ──
    const pendingAgg = await SubOrder.aggregate([
      { $match: { escrowStatus: "holding", status: { $in: ["processing", "shipped"] } }
 },
      { $group: { _id: null, total: { $sum: "$subtotal" } } },
    ]);
    const platformPending = Math.round(
      ((pendingAgg[0]?.total || 0) * PLATFORM_FEE_RATE) * 100
    ) / 100;

    // ── باقي الإحصائيات ─────────────────────────────────────────────
    const totalOrders      = await Order.countDocuments();
    const totalBuyers      = await User.countDocuments({ role: "buyer" });
    const totalSellers     = await User.countDocuments({ role: "seller" });
    const pendingProducts  = await Product.countDocuments({ status: "pending" });
    const pendingOrders    = await Order.countDocuments({ status: "pending" });
    const processingOrders = await Order.countDocuments({ status: "processing" });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id:    { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          sales:  { $sum: "$total" },
          orders: { $sum: 1 },
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو",
                    "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

    const chartData = monthlySales.map(m => ({
      month:  months[m._id.month - 1],
      sales:  m.sales,
      orders: m.orders,
    }));

    const recentOrders = await Order.find()
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSellers = await User.find({ role: "seller" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName storeName isActive");

    res.json({
      platformEarnings: earned.platformEarnings,   // ✅ الأرباح المحصّلة فعلاً
      platformPending,                              // ✅ الأرباح المعلقة
      totalSales:       earned.totalSales,
      sellerEarnings:   earned.sellerEarnings,
      platformFeeRate:  PLATFORM_FEE_RATE * 100,   // 10

      totalOrders, totalBuyers, totalSellers,
      pendingProducts, pendingOrders, processingOrders,
      chartData, recentOrders, recentSellers,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllOrdersAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "غير مصرح" });

    const orders = await Order.find()
  .populate("user", "fullName")
  .populate({
    path: "items.product",
    select: "name seller",
    populate: {
      path: "seller",
      select: "storeName fullName",
    },
  })
  .sort({ createdAt: -1 });

    res.json({ orders });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getPlatformEarnings = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "غير مصرح" });

    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser)
      return res.status(404).json({ error: "Admin not found" });

    const adminWallet = await Wallet.findOne({ user: adminUser._id });

    const feeTransactions = (adminWallet?.transactions || [])
      .filter(t => t.type === "platform_fee")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // ───── Pending Fees ─────
    const pendingSubOrders = await SubOrder.find({
      escrowStatus: "holding"
    });

    let platformPending = pendingSubOrders.reduce(
      (sum, so) => sum + (so.platformFee || so.subtotal * PLATFORM_FEE_RATE),
      0
    );

    platformPending = Math.round(platformPending * 100) / 100;

    // ───── Monthly Earnings ─────
    const monthlyMap = {};
    feeTransactions.forEach(t => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + t.amount;
    });

    const months = [
      "يناير","فبراير","مارس","أبريل","مايو","يونيو",
      "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
    ];

    const monthlyEarnings = Object.entries(monthlyMap).map(([key, amount]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        month: months[month - 1],
        year,
        amount: Math.round(amount * 100) / 100
      };
    });

    // ───── Response ─────
    res.json({
      availableBalance: adminWallet?.availableBalance || 0,
      totalEarned: adminWallet?.totalEarned || 0,

      pendingFees: platformPending, // 👈 ده الصح

      feeTransactions,
      monthlyEarnings,
      feeRate: PLATFORM_FEE_RATE * 100,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};