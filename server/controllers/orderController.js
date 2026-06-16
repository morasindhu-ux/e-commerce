const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Checkout user's active cart and place an order
// @route   POST /api/orders/checkout
// @access  Private
const checkout = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  // 1. Fetch user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your shopping cart is empty");
  }

  // 2. Validate product availability and compile order items
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      res.status(404);
      throw new Error("One or more products in your cart no longer exist");
    }

    if (product.stockQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for product: ${product.title}. Available: ${product.stockQuantity}`);
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });
  }

  // 3. Verify user wallet funds
  const user = await User.findById(req.user._id);
  if (user.balance < totalAmount) {
    res.status(400);
    throw new Error(`Insufficient wallet credit. Order total is $${totalAmount.toFixed(2)}, but you only have $${user.balance.toFixed(2)}`);
  }

  // 4. Update product inventories and deduct user balance
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    product.stockQuantity -= item.quantity;
    await product.save();
  }

  user.balance -= totalAmount;
  await user.save();

  // 5. Create the order
  const order = await Order.create({
    user: user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
    status: "PENDING"
  });

  // 6. Clear shopping cart
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Order placed successfully! Checkout completed.",
    order
  });
});

// @desc    Get logged-in user's order history
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Ensure user owns this order, or is admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
    res.status(403);
    throw new Error("Access denied to this order");
  }

  res.json({ success: true, order });
});

module.exports = {
  checkout,
  getOrders,
  getOrderById
};
