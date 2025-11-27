// routes/plannerRoutes.js
import express from "express";
import multer from "multer";
import PlannerItem from "../models/PlannerItem.js";
import Product from "../models/Product.js";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads/planner");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Create
router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image is required" });
  if (!req.body.category) return res.status(400).json({ message: "Category is required" });

  const item = await PlannerItem.create({
    label: req.body.label,
    image: `/uploads/planner/${req.file.filename}`,
    category: req.body.category

  });
  res.status(201).json(item);
});

// List
router.get("/", async (_, res) => {
  const items = await PlannerItem.find().sort({ order: 1 });
  res.json(items);
});

router.get("/active", async (req, res) => {
  const { categoryId } = req.query;

  const filter = { status: "Active" };
  if (categoryId) filter.category = categoryId;

  const items = await PlannerItem.find(filter).sort({ order: 1 });
  res.json(items);
});

// Delete
router.delete("/:id", async (req, res) => {
  const item = await PlannerItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not Found" });

  const fullPath = path.join(process.cwd(), item.image);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

  await PlannerItem.deleteOne({ _id: item._id });
  res.json({ message: "✅ Deleted" });
});
// routes/plannerRoutes.js
router.put("/:id", upload.single("image"), async (req, res) => {
  const item = await PlannerItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  item.label = req.body.label || item.label;
  item.category = req.body.category || item.category;

  if (req.file) {
    const oldPath = path.join(process.cwd(), item.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    item.image = `/uploads/planner/${req.file.filename}`;
  }

  await item.save();
  res.json({ message: "✅ Updated", item });
});

router.put("/toggle/:id", async (req, res) => {
  const item = await PlannerItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });

  item.status = item.status === "Active" ? "Inactive" : "Active";
  await item.save();
  res.json(item);
});
// Get Products Linked to Planner Item
router.get("/products/:id", async (req, res) => {
  try {
    const plannerId = req.params.id;

    const products = await Product.find({ plannerItem: plannerId })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error("Planner Product Fetch Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
