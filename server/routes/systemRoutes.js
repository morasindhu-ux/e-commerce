const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    version: "1.0.0",
    endpoints: [
      "/api/auth",
      "/api/stocks",
      "/api/portfolio",
      "/api/transactions",
      "/api/admin",
    ],
  });
});

module.exports = router;