import express from "express";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
const router = express.Router();

// Add Item To Cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, size, quantity: quantity || 1 }]
      });
    } else {
      // Check if product with same size already exists in cart
      const existingItem = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ product: productId, size, quantity: quantity || 1 });
      }
    }

    await cart.save();
    res.json({ success: true, message: "Item added to cart", cart });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error adding to cart" });
  }
});
// Get user cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId })
      .populate("items.product");

    if (!cart) return res.json({ items: [] });

    res.json(cart);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart" });
  }
});
router.delete("/remove", async (req, res) => {
  try {
    const { userId, productId, size } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.json({ success: true });

    cart.items = cart.items.filter(
      (item) =>
        !(item.product.toString() === productId.toString() && item.size === size)
    );

    await cart.save();
    return res.json({ success: true, message: "Item removed", cart });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Error removing item" });
  }
});


// Update Quantity
router.post("/update-qty", async (req, res) => {
  try {
    const { userId, productId, size, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.json({ success: false });

    // ✅ FIND ITEM CORRECTLY
    const item = cart.items.find(
      (i) => i.product._id.toString() === productId.toString() && i.size === size
    );

    if (!item) return res.json({ success: false });

    // ✅ Update quantity
    item.quantity += quantity;

    // ✅ Remove item if quantity goes below zero
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (i) =>
          !(
            i.product._id.toString() === productId.toString() &&
            i.size === size
          )
      );
    }

    // ✅ Recalculate total for coupon validation
    const cartTotal = cart.items.reduce(
      (sum, i) => sum + i.product.discountPrice * i.quantity,
      0
    );

    // ✅ Auto-remove coupon if now invalid
    if (cart.appliedCoupon && cartTotal < (cart.appliedCoupon.minPurchase || 0)) {
      cart.appliedCoupon = null;
    }

    await cart.save();

    return res.json({ success: true, cart });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Error updating qty" });
  }
});



// Apply Coupon
// apply coupon to cart
router.post("/apply-coupon", async (req, res) => {
  try {
    const { userId, code } = req.body;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.json({ success: false, message: "Cart not found" });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon) return res.json({ success: false, message: "Invalid coupon" });

    // Check active
    if (!coupon.isActive)
      return res.json({ success: false, message: "This coupon is no longer active" });

    // Check expiry
    if (coupon.expiryDate && coupon.expiryDate < new Date())
      return res.json({ success: false, message: "This coupon has expired" });

    // Calculate cart total
    const cartTotal = cart.items.reduce((sum, i) => sum + i.product.discountPrice * i.quantity, 0);

    // Check min purchase
    if (coupon.minPurchase && cartTotal < coupon.minPurchase)
      return res.json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchase} required`,
      });

    // ✅ Save full coupon object to cart
    cart.appliedCoupon = {
      code: coupon.code,
      description: coupon.description,    // ✅ ADD THIS
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive
    };

    await cart.save();

    return res.json({ success: true, message: "Coupon applied!", cart });

  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error applying coupon" });
  }
});

// DELETE /cart/clear
router.post("/clear", async (req, res) => {
  try {
    const { userId } = req.body;

    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], appliedCoupon: null }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
});


// REMOVE COUPON
router.post("/remove-coupon", async (req, res) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.json({ success: false });

    cart.appliedCoupon = null;
    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error removing coupon" });
  }
});
export default router;
