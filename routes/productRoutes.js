import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import Product from "../models/Product.js";
import Section from "../models/Section.js";

const router = express.Router();

/* ==========================================================
   UPLOAD FOLDER
========================================================== */
const uploadDir = path.join(process.cwd(), "uploads/products");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/* ==========================================================
   MULTER SETUP
========================================================== */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* Helper Safe Parser */
const safeParse = (v, fallback) => {
  try {
    return typeof v === "string" ? JSON.parse(v) : v || fallback;
  } catch {
    return fallback;
  }
};

/* ==========================================================
   ✅ CREATE PRODUCT
========================================================== */
router.post(
  "/createProduct",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "sizeChart", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      const coupon = safeParse(data.coupon, {});
      const colors = safeParse(data.colors, []);
      const sizes = safeParse(data.sizes, []);

      const isPlanner = data.productType === "planner";

      // ---------------- VALIDATION ----------------
      if (isPlanner) {
        if (!data.plannerItem) {
          return res.status(400).json({ message: "plannerItem is required" });
        }
        data.category = null;
        data.section = null;
      } else {
        const requiredFields = [
          "title",
          "brand",
          "sku",
          "price",
          "discountPrice",
          "stock",
          "category",
          "section",
          "fabricDetails",
          "knitOrWoven",
          "gender",
          "description",
          "countryOfOrigin",
          "seller",
        ];

        for (let f of requiredFields) {
          if (!data[f] || data[f].trim() === "") {
            return res.status(400).json({ message: `${f} is required` });
          }
        }
      }

      // ---------------- CREATE ----------------
      const product = await Product.create({
        title: data.title,
        brand: data.brand,
        sku: data.sku,

        price: Number(data.price),
        discountPrice: Number(data.discountPrice),
        discountPercent: Math.round(
          ((Number(data.price) - Number(data.discountPrice)) / Number(data.price)) * 100
        ),

        stock: Number(data.stock),

        category:
          !isPlanner && data.category
            ? new mongoose.Types.ObjectId(data.category)
            : null,

        section:
          !isPlanner && data.section
            ? new mongoose.Types.ObjectId(data.section)
            : null,

        productType: data.productType || "normal",
        plannerItem: isPlanner
          ? new mongoose.Types.ObjectId(data.plannerItem)
          : null,

        colors,
        sizes,
        fabricDetails: data.fabricDetails,
        knitOrWoven: data.knitOrWoven,
        gender: data.gender,
        description: data.description,
        status: data.status || "Active",

        images:
          req.files?.images?.map((f) => `/uploads/products/${f.filename}`) ||
          [],

        sizeChart: req.files?.sizeChart
          ? `/uploads/products/${req.files.sizeChart[0].filename}`
          : null,

        coupon,
        countryOfOrigin: data.countryOfOrigin,
        seller: data.seller,
        isHomeTrial: data.isHomeTrial === "true",
      });

      res.status(201).json(product);
    } catch (err) {
      console.error("❌ CREATE ERROR:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

/* ==========================================================
   GET SECTIONS WITH PRODUCTS
========================================================== */
router.get("/sections-with-products", async (req, res) => {
  try {
    const sections = await Section.find({ status: "Active" }).sort({
      createdAt: -1,
    });

    const response = await Promise.all(
      sections.map(async (s) => {
        const prods = await Product.find({ section: s._id })
          .populate("category", "name")
          .populate("section", "name")
          .limit(20);

        return {
          _id: s._id,
          name: s.name,
          description: s.description,
          categoryName: s.categoryName,
          products: prods,
        };
      })
    );

    res.json(response);
  } catch (err) {
    console.error("❌ SECTIONS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   GET ALL PRODUCTS
========================================================== */
router.get("/", async (_, res) => {
  try {
    const data = await Product.find()
      .populate("category", "name")
      .populate("section", "name")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.error("❌ GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   GET PRODUCT BY CATEGORY
========================================================== */
router.get("/by-category/:catId", async (req, res) => {
  try {
    const data = await Product.find({ category: req.params.catId })
      .populate("category", "name")
      .populate("section", "name");

    res.json(data);
  } catch (err) {
    console.error("❌ CAT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   ✅ UPDATE PRODUCT
========================================================== */
router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "sizeChart", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;
      const existing = await Product.findById(req.params.id);

      if (!existing) return res.status(404).json({ message: "Not found" });

      const isPlanner = data.productType === "planner";

      const coupon = safeParse(data.coupon, {});
      const colors = safeParse(data.colors, []);
      const sizes = safeParse(data.sizes, []);

      let updated = {
        title: data.title,
        brand: data.brand,
        sku: data.sku,
        price: Number(data.price),
        discountPrice: Number(data.discountPrice),
        discountPercent: Number(data.discountPercent) || 0,
        stock: Number(data.stock),
        productType: data.productType,

        category:
          !isPlanner
            ? data.category
              ? new mongoose.Types.ObjectId(data.category)
              : existing.category
            : null,

        section:
          !isPlanner && data.section
            ? new mongoose.Types.ObjectId(data.section)
            : null,

        plannerItem:
          isPlanner
            ? data.plannerItem
              ? new mongoose.Types.ObjectId(data.plannerItem)
              : existing.plannerItem
            : null,

        colors,
        sizes,
        fabricDetails: data.fabricDetails,
        knitOrWoven: data.knitOrWoven,
        gender: data.gender,
        description: data.description,
        status: data.status,
        coupon,
        countryOfOrigin: data.countryOfOrigin,
        seller: data.seller,
        isHomeTrial: data.isHomeTrial === "true",
      };

      // IMAGES (array)
      if (req.files?.images && req.files.images.length > 0) {
        updated.images = req.files.images.map(
          (f) => `/uploads/products/${f.filename}`
        );
      } else {
        updated.images = existing.images;
      }

      // SIZE CHART (single image)
      if (req.files?.sizeChart) {
        updated.sizeChart = `/uploads/products/${req.files.sizeChart[0].filename}`;
      } else {
        updated.sizeChart = existing.sizeChart;
      }

      const saved = await Product.findByIdAndUpdate(req.params.id, updated, {
        new: true,
      })
        .populate("category", "name")
        .populate("section", "name")
        .populate("plannerItem", "label");

      res.json(saved);
    } catch (err) {
      console.error("❌ UPDATE ERROR:", err);
      res.status(400).json({ message: err.message });
    }
  }
);

/* ==========================================================
   GET PRODUCT BY ID
========================================================== */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("section", "name")
      .populate("plannerItem", "label image");

    if (!product) return res.status(404).json({ message: "Not found" });

    if (product.productType === "planner") {
      product.category = null;
      product.section = null;
    }

    res.json(product);
  } catch (err) {
    console.error("❌ GET ONE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ==========================================================
   DELETE PRODUCT
========================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Not found" });

    // delete images & size chart
    const allImgs = [...product.images, product.sizeChart].filter(Boolean);

    allImgs.forEach((img) => {
      const p = path.join(process.cwd(), img);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });

    await product.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
