const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getCart);

router.post("/add", addToCart);
router.post("/update", updateCartItem);
router.post("/remove", removeFromCart);

module.exports = router;
