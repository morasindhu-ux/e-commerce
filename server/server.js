const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("./config/env");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();
const { notFound } = require("./middleware/notFoundMiddleware");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");

connectDB();
const PORT = process.env.PORT || 5000;


/* ========================================
   Security Middleware
======================================== */

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

/* ========================================
   Rate Limiting
======================================== */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

if (process.env.NODE_ENV === "production") {
  app.use(limiter);
}

/* ========================================
   Health Check
======================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopEZ E-Commerce API Running",
  });
});

/* ========================================
   API Routes
======================================== */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

/* ========================================
   404 Handler
======================================== */

app.use(notFound);

/* ========================================
   Global Error Handler
======================================== */

app.use(errorHandler);

let server;
const startServer = (portToTry) => {
  server = app.listen(portToTry, "127.0.0.1", () => {
    const actualPort = server.address().port;
    console.log(`Server running on port ${actualPort}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${portToTry} is in use, trying ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error("Server error:", err);
    }
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer(Number(PORT));
}

module.exports = { app, server };

