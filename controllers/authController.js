import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ================== SIGNUP ==================
export const signup = async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  try {
    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone required' });
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
    }

    // accept role directly, validate
    const allowedRoles = ['user', 'vendor', 'admin'];
    const finalRole = allowedRoles.includes(role) ? role : 'user';

    const hashed = password ? await bcrypt.hash(password, 10) : null;

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashed,
      role: finalRole,
    });

    const token = signToken(user);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ================== ADMIN LOGIN (email + password) ==================
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can login with email/password' });
    }

    if (user.blocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);

    res.status(200).json({
      message: 'Admin login successful',
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ================== USER LOGIN (Mobile + OTP) ==================
const otpStore = new Map(); // TEMP in-memory store (replace with Redis or DB in production)

// Step 1: Send OTP
export const sendUserOTP = async (req, res) => {
  const { phone } = req.body;

  try {
    console.log("📥 Incoming OTP request for phone:", phone);

    // Just check if blocked account exists
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser.blocked) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked. Contact support." });
    }

    // For now → hardcode OTP as 123456
    otpStore.set(phone, { otp: "123456", expires: Date.now() + 5 * 60 * 1000 });

    console.log(`📩 OTP for ${phone}: 123456`);

    res.status(200).json({
      message: "OTP sent successfully (use 123456 for testing)",
      phone,
    });
  } catch (error) {
    console.error("❌ sendUserOTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Step 2: Verify OTP
export const verifyUserOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const record = otpStore.get(phone);
    if (!record) return res.status(400).json({ message: "OTP not requested" });

    if (record.expires < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({ message: "OTP expired" });
    }

    // 🔹 Accept only 123456
    if (otp !== "123456") {
      return res.status(400).json({ message: "Invalid OTP (use 123456)" });
    }

    otpStore.delete(phone);

    let user = await User.findOne({ phone, role: "user" });

    // 🔹 If not found, register now (after successful OTP verification)
    if (!user) {
      user = await User.create({
        fullName: "New User",
        phone,
        role: "user",
      });
      console.log("✅ Registered new user after OTP:", user);
    }

    if (user.blocked) {
      return res
        .status(403)
        .json({ message: "Your account has been blocked. Contact support." });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "User login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("❌ verifyUserOTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
