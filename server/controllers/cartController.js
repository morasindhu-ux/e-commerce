const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({ success: true, cart });
});

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += qty;
  } else {
    cart.items.push({ product: productId, quantity: qty });
  }

  await cart.save();
  const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json({ success: true, cart: updatedCart, message: "Product added to cart successfully" });
});

// @desc    Update cart item quantity
// @route   POST /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);

  if (qty < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = qty;
    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.json({ success: true, cart: updatedCart, message: "Cart item quantity updated" });
  } else {
    res.status(404);
    throw new Error("Item not found in cart");
  }
});

// @desc    Remove item from cart
// @route   POST /api/cart/remove
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json({ success: true, cart: updatedCart, message: "Item removed from cart" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
};
