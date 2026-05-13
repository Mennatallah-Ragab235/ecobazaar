import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["sale", "platform_fee", "withdrawal", "refund"],
    required: true,
  },
  amount:      { type: Number, required: true },   // المبلغ الكلي للبيع
  fee:         { type: Number, default: 0 },        // نسبة الموقع
  net:         { type: Number, default: 0 },        // اللي وصل للبائع فعلاً
  subOrder:    { type: mongoose.Schema.Types.ObjectId, ref: "SubOrder" },
  description: { type: String },
  createdAt:   { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },

    availableBalance: { type: Number, default: 0 },  // جاهز للسحب
    pendingBalance:   { type: Number, default: 0 },  // محجوز في escrow

    totalEarned:  { type: Number, default: 0 },  // إجمالي المكسب
    totalFees:    { type: Number, default: 0 },  // إجمالي نسبة الموقع
    totalWithdrawn: { type: Number, default: 0 }, // إجمالي المسحوب

    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);




// import mongoose from "mongoose";

// const walletSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

//   availableBalance: { type: Number, default: 0 },
//   pendingBalance: { type: Number, default: 0 },
// });


// export default mongoose.model("Wallet", walletSchema);
