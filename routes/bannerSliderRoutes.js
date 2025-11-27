import express from "express";
import multer from "multer";
import BannerSlider from "../models/BannerSlider.js";
import path from "path";
import fs from "fs";
import { body, validationResult } from "express-validator";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads/banners");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });


router.post(
  "/create",
  upload.single("image"),
  body("alt").notEmpty().withMessage("Banner title is required"),
  body("category").notEmpty().withMessage("Category is required"),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    if (!req.file) return res.status(400).json({ message: "Image is required" });

    try {
      const banner = await BannerSlider.create({
        image: `/uploads/banners/${req.file.filename}`,
        alt: req.body.alt,
        category: req.body.category
      });
      res.status(201).json({ message: "Banner Created", banner });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const banner = await BannerSlider.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.alt = req.body.alt || banner.alt;
    banner.category = req.body.category || banner.category;

    if (req.file) {
      const oldPath = path.join(process.cwd(), banner.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      banner.image = `/uploads/banners/${req.file.filename}`;
    }

    await banner.save();
    res.json({ message: "Banner updated", banner });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Toggle Banner Status (Active <-> Inactive)
router.put("/toggle-status/:id", async (req, res) => {
  try {
    const banner = await BannerSlider.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.status = banner.status === "Active" ? "Inactive" : "Active";
    await banner.save();

    res.json({ message: "✅ Status Updated", status: banner.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get All Banners
router.get("/", async (req, res) => {
  const { categoryId } = req.query;

  const filter = {};

  // FIX:
  if (categoryId && categoryId !== "undefined" && categoryId !== "") {
    filter.category = categoryId;
  }

  const banners = await BannerSlider.find(filter).sort({ order: 1 });
  res.json(banners);
});


// ✅ Delete Banner
router.delete("/:id", async (req, res) => {
  const banner = await BannerSlider.findById(req.params.id);
  if (!banner) return res.status(404).json({ message: "Not found" });

  const fullPath = path.join(process.cwd(), banner.image);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

  await BannerSlider.deleteOne({ _id: banner._id });
  res.json({ message: "✅ Banner Deleted" });
});

export default router;
