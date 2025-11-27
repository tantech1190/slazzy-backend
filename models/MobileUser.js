import mongoose from "mongoose";

const mobileUserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    mobile: { type: String, required: true, unique: true, index: true },
    email: { type: String, trim: true },     
    lastLoginAt: { type: Date },
    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("MobileUser", mobileUserSchema);
