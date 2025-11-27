import mongoose from "mongoose";

mongoose.models.Order && delete mongoose.models.Order;

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      size: String,
      quantity: Number,
      price: Number
    }
  ],

  address: {
    name: String,
    phone: String,
    fullAddress: String,
    city: String,
    zip: String
  },

  subtotal: Number,

  // ✅ Store only coupon code + discount amount
  couponCode: String,
  discountAmount: Number,

  paymentMethod: { type: String, enum: ["cod", "online"], required: true },
  deliveryOption: { type: String, enum: ["standard", "home"], required: true },
  shippingFee: Number,
  totalAmount: Number,
  status: { type: String, default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
