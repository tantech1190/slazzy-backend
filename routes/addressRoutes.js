import express from "express";
import Address from "../models/Address.js";

const router = express.Router();

/* ======================================================
   POST /addresses → Add new address
====================================================== */
router.post("/", async (req, res) => {
  try {
        console.log("📩 Incoming Body:", req.body); // 👈 Add this line

    const {
      userId,
      mobile,
      firstName,
      lastName,
      address1,
      address2,
      city,
      country,
      zip,
      phone,
      isDefault,
    } = req.body;

    if (!userId || !mobile || !firstName || !address1 || !city || !zip || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // If setting as default → unset all other defaults for same user
    if (isDefault) {
      await Address.updateMany({ userId }, { $set: { isDefault: false } });
    }

    const address = await Address.create({
      userId,
      mobile,
      firstName,
      lastName,
      address1,
      address2,
      city,
      country,
      zip,
      phone,
      isDefault,
    });

    res.json({ success: true, message: "Address added successfully", address });
  } catch (err) {
    console.error("❌ Add address error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ======================================================
   GET /addresses/:userId → Get all user addresses
====================================================== */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (err) {
    console.error("❌ Fetch addresses error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ======================================================
   PATCH /addresses/:id → Update existing address
====================================================== */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault, ...fields } = req.body;

    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ message: "Address not found" });

    // If setting as default → unset others for the same user
    if (isDefault) {
      await Address.updateMany(
        { userId: address.userId, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, fields, { isDefault });
    await address.save();

    res.json({ success: true, message: "Address updated", address });
  } catch (err) {
    console.error("❌ Update address error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ======================================================
   DELETE /addresses/:id → Delete address
====================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByIdAndDelete(id);
    if (!address) return res.status(404).json({ message: "Address not found" });
    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    console.error("❌ Delete address error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
