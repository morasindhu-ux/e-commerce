const mongoose = require("mongoose");
const path = require("path");

// Set env variables before anything else loads
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://localhost:27017/stocktrading_test";
process.env.JWT_SECRET = "test_jwt_secret_key_for_stock_trading";
process.env.JWT_EXPIRE = "1h";

// Clean the DB between tests
const cleanDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  } else if (mongoose.connection.readyState === 2) {
    // Wait for connecting state to resolve
    await new Promise((resolve) => {
      mongoose.connection.once("connected", resolve);
    });
  }
  
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
};

// Disconnect from the database
const closeDatabase = async () => {
  // No-op to maintain the database connection pool across serial Jest test runs.
  // Jest exits the process cleanly at the end via the --forceExit flag.
};

module.exports = {
  cleanDatabase,
  closeDatabase,
};
