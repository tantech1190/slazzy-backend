import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("City", citySchema);
