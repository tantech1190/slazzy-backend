import express from "express";
import { auth, requireRole } from "../middleware/auth.js";
import User from "../models/User.js";
import MobileUser from "../models/MobileUser.js";
import Order from "../models/Order.js";

const router = express.Router();

/* ==========================================================
   🔹 ADMIN PANEL USERS (email-based)
========================================================== */

// ✅ Get all admin/vendor/users (excluding main admin)
router.get("/users", auth, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: { $not: /^admin$/i } });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Block admin/vendor user
router.patch("/users/:id/block", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User blocked successfully", user });
  } catch (err) {
    console.error("❌ Block user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Unblock admin/vendor user
router.patch("/users/:id/unblock", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unblocked successfully", user });
  } catch (err) {
    console.error("❌ Unblock user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ==========================================================
   🔹 MOBILE USERS (mobile + otp based)
   These endpoints are separate to avoid path collisions
========================================================== */

// ✅ Get all mobile app users
router.get("/mobile-users", auth, requireRole("admin"), async (req, res) => {
  try {
    const users = await MobileUser.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching mobile users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get single mobile user details
router.get("/mobile-users/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await MobileUser.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching mobile user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Block mobile user
router.patch("/mobile-users/:id/block", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await MobileUser.findByIdAndUpdate(
      req.params.id,
      { blocked: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: "User blocked", user });
  } catch (err) {
    console.error("❌ Error blocking mobile user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Unblock mobile user
router.patch("/mobile-users/:id/unblock", auth, requireRole("admin"), async (req, res) => {
  try {
    const user = await MobileUser.findByIdAndUpdate(
      req.params.id,
      { blocked: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: "User unblocked", user });
  } catch (err) {
    console.error("❌ Error unblocking mobile user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// ✅ ADMIN DASHBOARD STATS
router.get("/stats", auth, requireRole("admin"), async (req, res) => {
  try {
    const totalUsers = await MobileUser.countDocuments(); // mobile app users
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      success: true,
      totalUsers,
      totalOrders,
      totalRevenue,
    });

  } catch (err) {
    console.error("❌ Dashboard Stats Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

export default router;
