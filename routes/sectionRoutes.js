import express from "express";
import Section from "../models/Section.js";

const router = express.Router();

// ✅ Create Section
router.post("/create", async (req, res) => {
  try {
    const { name, description, status, categoryId, categoryName } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const section = await Section.create({
      name,
      description,
      status,
      categoryId,
      categoryName,
    });

    res.status(201).json(section);
  } catch (err) {
    console.error("❌ Error creating section:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// ✅ Get All Sections
router.get("/", async (_, res) => {
  try {
    // If you want to include the category name (from Category model),
    // you can use .populate("categoryId", "name") — optional
    const sections = await Section.find().sort({ createdAt: -1 });
    res.json(sections);
  } catch (err) {
    console.error("❌ Error fetching sections:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// ✅ Update Section
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, categoryId, categoryName } = req.body;

    const updatedSection = await Section.findByIdAndUpdate(
      id,
      { name, description, status, categoryId, categoryName },
      { new: true, runValidators: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json(updatedSection);
  } catch (err) {
    console.error("❌ Error updating section:", err.message);
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete Section
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Section.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ message: "✅ Section deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting section:", err.message);
    res.status(400).json({ message: err.message });
  }
});

export default router;
