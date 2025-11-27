import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "Active" },

    // ✅ Added fields for category
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    categoryName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Section", SectionSchema);
