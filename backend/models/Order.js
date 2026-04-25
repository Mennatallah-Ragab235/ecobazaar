import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        price: Number,
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      zip: String,
    },

    shippingMethod: String,
    shippingPrice: Number,

    paymentMethod: String,

    subtotal: Number,
    total: Number,

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);


export default mongoose.model("Order", orderSchema);
