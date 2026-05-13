import mongoose from "mongoose";

const subOrderSchema = new mongoose.Schema(
  {
    mainOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price:    Number,
      },
    ],

    subtotal: {
      type:    Number,
      default: 0,
    },

    status: {
      type:    String,
      enum:    ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    trackingNumber: {
      type:    String,
      default: null,
    },

    escrowStatus: {
      type:    String,
      enum:    ["holding", "released"],
      default: "holding",
    },

    paymentStatus: {
      type:    String,
      enum:    ["pending", "paid"],
      default: "pending",
    },

    // ✅ حقول الـ escrow والعمولة
    platformFee:    { type: Number, default: 0 },   // 10% للموقع
    netAmount:      { type: Number, default: 0 },   // 90% للبائع
    fundsReleased:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("SubOrder", subOrderSchema);