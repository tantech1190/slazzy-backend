import express from "express";
import { razorpay } from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";

const router = express.Router();

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    res.json({ success: true, order_id: order.id, amount: order.amount });
  } catch (err) {
    res.json({ success: false, error: err });
  }
});

router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(sign)
    .digest("hex");

  if (expectedSign !== razorpay_signature) {
    return res.json({ success: false, message: "Invalid signature" });
  }

  const newOrder = await Order.create({
    user: req.body.userId,        // ✅ Must be `user`
    items: req.body.items,
    address: req.body.address,
    paymentMethod: req.body.paymentMethod,
    deliveryOption: req.body.deliveryOption,
    shippingFee: req.body.shippingFee,
    subtotal: req.body.subtotal,
    couponCode: req.body.couponCode,
    discountAmount: req.body.discountAmount,
    totalAmount: req.body.totalAmount,
    status: "Paid",               // ✅ Must be `status`
    razorpay_order_id,
    razorpay_payment_id
  });

  return res.json({ success: true, order: newOrder });
});



export default router;
