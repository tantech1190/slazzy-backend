import express from "express";
import multer from "multer";
import CategoryBanner from "../models/CategoryBanner.js";
import path from "path";
import fs from "fs";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads/category-banners");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });


// 🌟 CREATE NEW BANNER ALWAYS
router.post("/:categoryId", upload.single("image"), async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const newBanner = await CategoryBanner.create({
      category: categoryId,
      image: `/uploads/category-banners/${req.file.filename}`,
    });

    res.json({ message: "Category Banner Created", banner: newBanner });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get("/", async (req, res) => {
  try {
    const banners = await CategoryBanner.find()
      .populate("category")    // get full category details
      .sort({ createdAt: -1 });

    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:categoryId", async (req, res) => {
  const banners = await CategoryBanner.find({
    category: req.params.categoryId,
    status: "Active"
  });

  res.json(banners);
});

router.put("/update/:bannerId", upload.single("image"), async (req, res) => {
  try {
    const { bannerId } = req.params;
    const { category } = req.body;

    const banner = await CategoryBanner.findById(bannerId);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (req.file) {
      const oldPath = path.join(process.cwd(), banner.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      banner.image = `/uploads/category-banners/${req.file.filename}`;
    }

    if (category) banner.category = category;

    await banner.save();

    res.json({ message: "Banner updated successfully", banner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 🌟 DELETE BANNER
// 🌟 DELETE BANNER BY BANNER ID
router.delete("/:bannerId", async (req, res) => {
  try {
    const { bannerId } = req.params;

    // Find banner by ID
    const banner = await CategoryBanner.findById(bannerId);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete image file
    const fullPath = path.join(process.cwd(), banner.image);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    // Delete banner document
    await CategoryBanner.deleteOne({ _id: bannerId });

    res.json({ message: "Category banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
