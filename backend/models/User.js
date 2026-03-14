import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, default: "" },
    password: { type: String, required: true },
    confirmPassword: {type: String},
role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    // Seller-only fields
    storeName:           { type: String, default: "" },
    storeDescription:    { type: String, default: "" },
    commercialRegNumber: { type: String, default: "" },
    nationalIdNumber:    { type: String, default: "" },
    taxNumber:           { type: String, default: "" },
    website:             { type: String, default: "" },
    nationalIdImage: { type: String } ,
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);