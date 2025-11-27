import express from "express";
import City from "../models/City.js";

const router = express.Router();

// Create City
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "City name required" });

    const exists = await City.findOne({ name });
    if (exists) return res.status(400).json({ message: "City already exists" });

    const city = await City.create({ name });
    res.status(201).json(city);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get All Cities
router.get("/", async (_req, res) => {
  const cities = await City.find().sort({ name: 1 });
  res.json(cities);
});

// Toggle Active Status
router.put("/toggle/:id", async (req, res) => {
  const city = await City.findById(req.params.id);
  if (!city) return res.status(404).json({ message: "City not found" });

  city.active = !city.active;
  await city.save();
  res.json(city);
});

// Delete City
router.delete("/:id", async (req, res) => {
  await City.findByIdAndDelete(req.params.id);
  res.json({ message: "City deleted" });
});

export default router;
