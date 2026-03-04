import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  storeName:    { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  quantity:    { type: Number, default: 0 },
  category:    { type: String, required: true },
  image:       { type: String },
  images:      [{ type: String }],
  isEcoFriendly: { type: Boolean, default: true },
  discount:    { type: Number, default: 0 },
  featured:    { type: Boolean, default: false },
  rating:      { type: Number, default: 0 },
  reviews:     { type: Number, default: 0 },
  sku:         { type: String },
  materials:   { type: String },
  origin:      { type: String },
  weight:      { type: Number },
  ecoFeatures: [{ type: String }],
  certificates:{ type: String },
  status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);