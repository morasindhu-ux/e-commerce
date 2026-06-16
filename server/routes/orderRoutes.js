const express = require("express");
const router = express.Router();
const {
  checkout,
  getOrders,
  getOrderById
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getOrders);

router.post("/checkout", checkout);
router.get("/:id", getOrderById);

module.exports = router;
