import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String, required: true },
  quantity: { type: Number, default: 1 }
});

const appliedCouponSchema = new mongoose.Schema({
    code: String,
    description: String,   // ✅ ADD THIS
    discountType: String,
    discountValue: Number,
    minPurchase: Number,
    maxDiscount: Number,
    expiryDate: Date,
    isActive: Boolean
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema],

  // ✅ store the coupon applied at cart level
  appliedCoupon: { type: appliedCouponSchema, default: null }

}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
