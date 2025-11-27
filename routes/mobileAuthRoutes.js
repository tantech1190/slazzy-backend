import express from "express";
import MobileUser from "../models/MobileUser.js";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

/* -------------------------------------------------------------
   STEP 1 — SEND OTP (DEV: Always 123456)
------------------------------------------------------------- */
router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile)
      return res.status(400).json({ success: false, message: "Mobile number is required" });

    const otp = "123456"; // Dev-only OTP

    // Find or create user
    let user = await MobileUser.findOne({ mobile });
    if (!user) {
      user = await MobileUser.create({ mobile });
    }

    console.log(`📲 DEV OTP for ${mobile}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully (use 123456 in dev)",
    });
  } catch (err) {
    console.error("❌ Send OTP Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* -------------------------------------------------------------
   STEP 2 — VERIFY OTP
------------------------------------------------------------- */
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp)
      return res.status(400).json({ success: false, message: "Mobile and OTP are required" });

    const user = await MobileUser.findOne({ mobile });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (otp !== "123456")
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // If name or email missing → return next step
    if (!user.name || !user.email) {
      return res.json({
        success: true,
        step: "ask_details",
        message: "Please provide your name and email",
      });
    }

    // Existing user → normal login
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, mobile: user.mobile, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      step: "login_done",
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* -------------------------------------------------------------
   STEP 3 — SAVE NAME + EMAIL
------------------------------------------------------------- */
router.post("/save-name", async (req, res) => {
  try {
    const { mobile, name, email } = req.body;

    if (!mobile || !name || !email)
      return res.status(400).json({
        success: false,
        message: "Mobile, name and email are required",
      });

    const user = await MobileUser.findOne({ mobile });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.name = name.trim();
    user.email = email.trim().toLowerCase();
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, mobile: user.mobile, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      step: "registered",
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Save Details Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/* -------------------------------------------------------------
   DELETE User by Mobile
------------------------------------------------------------- */
router.delete("/delete/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;

    const user = await MobileUser.findOneAndDelete({ mobile });

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });

  } catch (err) {
    console.error("❌ Delete User Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
