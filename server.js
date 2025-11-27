import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import sectionRoutes from "./routes/sectionRoutes.js"; // 👈 FIXED
import mobileAuthRoutes from "./routes/mobileAuthRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import bannerSliderRoutes from "./routes/bannerSliderRoutes.js";
import deliveryZoneRoutes from "./routes/deliveryZoneRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/order.js";
import paymentRoute from "./routes/paymentRoute.js";
import categoryBannerRoutes from "./routes/categoryBannerRoutes.js";

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// health check
app.get("/", (_, res) => res.send("API OK"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sections", sectionRoutes); // 👈 uses default export
app.use("/api/mobile-auth", mobileAuthRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banner-slider", bannerSliderRoutes);
app.use("/api/delivery-zones", deliveryZoneRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment/razorpay", paymentRoute);
app.use("/api/category-banner", categoryBannerRoutes);

// serve static uploads
app.use("/uploads", express.static("uploads"));

const { PORT = 3001, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI)
  .then(() => {
        console.log("🌍 Connected to MongoDB Atlas");
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  });
