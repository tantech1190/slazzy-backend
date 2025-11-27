import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },

    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },

    stock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    description: { type: String, required: true, trim: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },

    productType: { type: String, enum: ["normal", "planner"], default: "normal" },
    plannerItem: { type: mongoose.Schema.Types.ObjectId, ref: "PlannerItem" },

    colors: [{ type: String }],
    sizes: [{ type: String }],

    fabricDetails: { type: String, required: true },
    knitOrWoven: { type: String, required: true },
    gender: { type: String, required: true },
    countryOfOrigin: { type: String, trim: true },
    seller: { type: String, trim: true },

    images: [{ type: String, required: true }],
    sizeChart: { type: String }, // <-- NEW FIELD
    isHomeTrial: { type: Boolean, default: false },

    coupon: {
      code: String,
      discountType: { type: String, enum: ["percent", "flat"], default: "percent" },
      discountValue: Number,
      minCartValue: Number,
      description: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
