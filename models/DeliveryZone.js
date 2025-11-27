import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryZone", deliveryZoneSchema);
