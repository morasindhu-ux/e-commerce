const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getCurrentUser,
  getProfile,
  updateProfile,
  logoutUser,
  topupWallet,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { registerValidation, loginValidation } = require("../validators/authValidator");
const validate = require("../middleware/validationMiddleware");

router.post("/register", registerValidation, validate, registerUser);
router.post("/login", loginValidation, validate, loginUser);

router.get("/me", protect, getCurrentUser);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/wallet/topup", protect, topupWallet);

router.post("/logout", protect, logoutUser);

module.exports = router;