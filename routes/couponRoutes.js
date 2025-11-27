import express from "express";
import Coupon from "../models/Coupon.js";

const router = express.Router();

/* 🟢 Create Coupon */
router.post("/", async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ success: true, message: "Coupon created", coupon });
  } catch (err) {
    console.error("❌ Create coupon error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* 🟡 Get All Coupons */
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    console.error("❌ Fetch coupons error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* 🟣 Update Coupon */
router.patch("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    res.json({ success: true, message: "Coupon updated", coupon });
  } catch (err) {
    console.error("❌ Update coupon error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* 🔴 Delete Coupon */
router.delete("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    console.error("❌ Delete coupon error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
