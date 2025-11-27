import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

const router = express.Router();

router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.json({ success: false, message: "Error fetching orders" });
  }
});

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// CREATE ORDER
router.post("/create", async (req, res) => {
  try {
  const { userId, items, address, paymentMethod, deliveryOption, shippingFee, totalAmount, subtotal, couponCode, discountAmount } = req.body;

const order = await Order.create({
  user: userId,
  items,
  address,
  paymentMethod,
  deliveryOption,
  shippingFee,
  totalAmount,
  subtotal,
  couponCode,
  discountAmount
});


    // ✅ Clear user's cart permanently
    await Cart.findOneAndUpdate(
      { user: userId },
    { $set: { items: [], totalQty: 0 } },
      { new: true }
    );

    res.json({ success: true, order });

  } catch (error) {
    console.log(error);
    console.log("ORDER CREATE ERROR:", error);
    return res.json({ success: false, message: error.message });
  }
});


// CANCEL ORDER
router.put("/cancel/:orderId", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status: "Cancelled" }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.json({ success: false, message: "Unable to cancel" });
  }
});

// UPDATE ORDER STATUS
router.put("/update-status/:orderId", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status: req.body.status }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.json({ success: false });
  }
});
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    res.json({ success: true, order });
  } catch {
    res.json({ success: false });
  }
});

export default router;
