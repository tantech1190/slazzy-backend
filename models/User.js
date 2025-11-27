import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },

    // 🔹 Email required only for admin/vendor, optional for user
    email: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs without email
      lowercase: true,
      index: true,
    },

    // 🔹 Password required only for admin/vendor
    password: { type: String, select: false },

    // 🔹 Phone required for users
    phone: { type: String, unique: true, sparse: true, index: true },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
      index: true,
    },

    blocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔹 Custom validation: enforce required fields based on role
userSchema.pre("validate", function (next) {
  if (this.role === "admin" || this.role === "vendor") {
    if (!this.email) {
      return next(new Error("Email is required for admins/vendors"));
    }
    if (!this.password) {
      return next(new Error("Password is required for admins/vendors"));
    }
  }

  if (this.role === "user") {
    if (!this.phone) {
      return next(new Error("Phone is required for users"));
    }
  }

  next();
});

const User = mongoose.model("User", userSchema);
export default User;
