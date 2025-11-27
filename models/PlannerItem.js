// models/PlannerItem.js
import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // Title
    image: { type: String, required: true }, // Image path
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    order: { type: Number, default: 0 },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("PlannerItem", plannerSchema);
