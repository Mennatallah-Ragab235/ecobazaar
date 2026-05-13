import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },

    // ✅ ربط بالـ SubOrders — كل بائع عنده SubOrder مستقل
    subOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "SubOrder",
      },
    ],

    // بيتحفظ للـ reference بس — التفاصيل في SubOrders
    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        seller:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        quantity: Number,
        price:    Number,
      },
    ],

    shippingAddress: {
      fullName: String,
      phone:    String,
      address:  String,
      city:     String,
      zip:      String,
    },

    shippingMethod: String,
    shippingPrice:  { type: Number, default: 0 },
    paymentMethod:  String,

    subtotal: Number,
    total:    Number,

    // pending | processing | partially_shipped | shipped | delivered | cancelled
    status: {
      type:    String,
      default: "pending",
    },

    fundsReleased: {
  type: Boolean,
  default: false,
},

    paymentStatus: {
      type:    String,
      enum:    ["pending", "processing", "paid", "failed"],
      default: "pending",
    },

    // holding | partially_released | released
    escrowStatus: {
      type:    String,
      enum:    ["holding", "partially_released", "released"],
      default: "holding",
    },

    platformFee:  { type: Number, default: 0 },
    sellerAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);