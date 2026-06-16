const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

/**
 * Generate JWT Token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    {
      id,
      role,
    },
    process.env.JWT_SECRET,
    {
    expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

/**
 * @desc Register User
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
 


const { name, email, password } = req.body;

   const normalizedEmail = email?.toLowerCase().trim();

   if (!email) {
  res.status(400);
  throw new Error("Email is required");
}
  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  // Check existing user
  const existingUser = await User.findOne({
  email: normalizedEmail,
});

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create User
  const user = await User.create({
  name: name.trim(),
  email: normalizedEmail,
  password: hashedPassword,
});

  if (!user) {
    res.status(500);
    throw new Error("Failed to create user");
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc Login User
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  console.log("LOGIN BODY:", req.body);

  const { email, password } = req.body;

  console.log("EMAIL:", email);
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
  email: normalizedEmail,
});

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc Get Current User
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password"
  );

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
 * @desc Get User Profile
 * @route GET /api/auth/profile
 * @access Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "-password"
  );

  res.status(200).json({
    success: true,
    user,
  });
});

/**
 * @desc Update Profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;

  if (req.body.email) {
    user.email = req.body.email;
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      req.body.password,
      salt
    );
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  });
});

/**
 * @desc Logout User
 * @route POST /api/auth/logout
 * @access Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

/**
 * @desc Top Up Wallet Balance
 * @route PUT /api/auth/wallet/topup
 * @access Private
 */
const topupWallet = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined || amount <= 0) {
    res.status(400);
    throw new Error("Please enter a valid amount greater than 0");
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.balance = (user.balance || 0) + Number(amount);
  await user.save();

  res.status(200).json({
    success: true,
    message: `Successfully added ${amount} credits to your wallet!`,
    balance: user.balance,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getProfile,
  updateProfile,
  logoutUser,
  topupWallet,
};