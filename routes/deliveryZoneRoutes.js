import express from "express";
import DeliveryZone from "../models/DeliveryZone.js";

const router = express.Router();

// GET all zones
router.get("/", async (req, res) => {
  const zones = await DeliveryZone.find().sort({ city: 1, pincode: 1 });
  res.json(zones);
});

// ADD new pincode
router.post("/", async (req, res) => {
  const { city, pincode } = req.body;
  if (!city || !pincode) return res.status(400).json({ message: "City & Pincode are required" });

  const exists = await DeliveryZone.findOne({ city, pincode });
  if (exists) return res.status(409).json({ message: "Pincode already exists" });

  const zone = await DeliveryZone.create({ city, pincode });
  res.status(201).json(zone);
});

// TOGGLE active status
router.put("/toggle/:id", async (req, res) => {
  const zone = await DeliveryZone.findById(req.params.id);
  if (!zone) return res.status(404).json({ message: "Not found" });

  zone.active = !zone.active;
  await zone.save();
  res.json(zone);
});
router.get("/check", async (req, res) => {
  const pin = req.query.pin;
  if (!pin) return res.status(400).json({ message: "PIN required" });

  const match = await DeliveryZone.findOne({ pincode: pin, active: true });
  if (match) return res.json({ serviceable: true, city: match.city });

  return res.json({ serviceable: false });
});

// DELETE zone
router.delete("/:id", async (req, res) => {
  await DeliveryZone.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
