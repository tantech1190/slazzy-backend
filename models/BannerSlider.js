import mongoose from "mongoose";

const bannerSliderSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    alt: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    order: { type: Number, default: 0 },

    // ⭐ NEW FIELD
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("BannerSlider", bannerSliderSchema);
