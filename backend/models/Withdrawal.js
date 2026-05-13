import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },

    method: {
      type: String,
      default: "manual", // vodafone cash / bank / etc
    },

  },
  { timestamps: true }
);

export default mongoose.model("Withdrawal", withdrawalSchema);
