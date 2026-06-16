const mongoose = require("mongoose");
const { closeDatabase } = require("./setup");

describe("MongoDB Connection Test", () => {
  beforeAll(async () => {
    // Explicitly import env config setup
    require("./setup");
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it("should connect to the MongoDB database successfully", async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    expect(mongoose.connection.name).toBe("stocktrading_test");
  });
});
