const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

/**
 * GET /api/admin/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  const [totalUsers, users] = await Promise.all([
    User.countDocuments(),
    User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    page,
    totalPages: Math.ceil(totalUsers / limit),
    count: users.length,
    totalUsers,
    users,
  });
});

/**
 * GET /api/admin/users/:id
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.params.id
  ).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * DELETE /api/admin/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.params.id
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "ADMIN") {
    res.status(400);
    throw new Error(
      "Cannot delete admin accounts"
    );
  }

  await Cart.deleteMany({
    user: user._id,
  });

  await Order.deleteMany({
    user: user._id,
  });

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User account and related carts/orders deleted successfully",
  });
});

/**
 * GET /api/admin/stats
 */
const getDashboardStats = asyncHandler(
  async (req, res) => {
    const [
      totalUsers,
      totalStocks,
      totalPortfolios,
      totalTransactions,
      transactionVolume,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Cart.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStocks, // Re-mapped totalStocks parameter to product count for dashboard API compatibility
        totalPortfolios, // Re-mapped totalPortfolios to cart count
        totalTransactions, // Re-mapped totalTransactions to total order count
        totalVolume: transactionVolume[0]?.total || 0, // Re-mapped trade volume to store sales
      },
    });
  }
);

/**
 * GET /api/admin/orders
 * @desc Get all orders in the system (Fulfillment directory)
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders
  });
});

/**
 * PUT /api/admin/orders/:id/status
 * @desc Update shipment status of an order
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    order: updatedOrder,
    message: `Order status updated to ${status}`
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  getDashboardStats,
  getAllOrders,
  updateOrderStatus
};