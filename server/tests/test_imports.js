const path = require("path");
console.log("=== STARTING TEST_IMPORTS.JS ===", "PID:", process.pid, "PORT:", process.env.PORT);
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
console.log("=== ENV LOADED ===", "PORT:", process.env.PORT);
require("../config/env");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// const authRoutes = require("../routes/authRoutes");
// const stockRoutes = require("../routes/stockRoutes");
// const portfolioRoutes = require("../routes/portfolioRoutes");
// const transactionRoutes = require("../routes/transactionRoutes");
// const adminRoutes = require("../routes/adminRoutes");

const app = express();
const { notFound } = require("../middleware/notFoundMiddleware");
const { errorHandler } = require("../middleware/errorMiddleware");
const connectDB = require("../config/db");

connectDB();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use(limiter);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Stock Trading API Running",
  });
});

// app.use("/api/auth", authRoutes);
// app.use("/api/stocks", stockRoutes);
// app.use("/api/portfolio", portfolioRoutes);
// app.use("/api/transactions", transactionRoutes);
// app.use("/api/admin", adminRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
let server;
console.log("=== CALLING APP.LISTEN ===", "PID:", process.pid, "PORT:", PORT);
server = app.listen(PORT, "0.0.0.0", () => {
  const actualPort = server.address().port;
  console.log(`Server running on port ${actualPort}`);
});
