const request = require("supertest");
require("./setup");
const { app } = require("../server");
const { cleanDatabase, closeDatabase } = require("./setup");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");

describe("Admin and Order Routes", () => {
  let userToken;
  let adminToken;
  let regularUser;
  let adminUser;
  let sampleOrder;

  beforeEach(async () => {
    await cleanDatabase();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Create a regular user
    regularUser = await User.create({
      name: "John Regular",
      email: "john@example.com",
      password: hashedPassword,
      role: "USER",
    });

    // Create an admin user
    adminUser = await User.create({
      name: "Boss Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    // Generate tokens
    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "password123" });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    adminToken = adminLogin.body.token;

    // Create a sample product & order
    const product = await Product.create({
      sku: "NFLX",
      title: "Netflix Subscription",
      price: 15.99,
      category: "Streaming",
      stockQuantity: 100,
      description: "Netflix Gift Card"
    });

    sampleOrder = await Order.create({
      user: regularUser._id,
      items: [{
        product: product._id,
        quantity: 2,
        price: 15.99
      }],
      totalAmount: 31.98,
      shippingAddress: "123 Netflix Ave",
      status: "PENDING"
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe("Admin Store Manager Routes (/api/admin/*)", () => {
    it("should allow admin to get all users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users.length).toBe(2);
    });

    it("should reject standard user from listing users", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("should allow admin to get user details by id", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${regularUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe("John Regular");
    });

    it("should allow admin to view dashboard stats", async () => {
      const res = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalUsers).toBe(2);
      expect(res.body.stats.totalTransactions).toBe(1); // mapped to Order count
      expect(res.body.stats.totalVolume).toBe(31.98); // mapped to Order totalAmount
    });

    it("should allow admin to delete a standard user", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${regularUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("deleted successfully");

      const checkUser = await User.findById(regularUser._id);
      expect(checkUser).toBeNull();
    });

    it("should reject deleting another admin user", async () => {
      const res = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Cannot delete admin accounts");
    });

    it("should allow admin to get all store orders for shipment fulfillment", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders.length).toBe(1);
    });

    it("should allow admin to update shipping status of an order", async () => {
      const res = await request(app)
        .put(`/api/admin/orders/${sampleOrder._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "SHIPPED" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.status).toBe("SHIPPED");
    });
  });

  describe("Customer Order Routes (/api/orders/*)", () => {
    it("should allow user to fetch their own order history", async () => {
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders.length).toBe(1);
      expect(res.body.orders[0].items[0].product.sku).toBe("NFLX");
    });

    it("should allow user to view their own order receipt by id", async () => {
      const res = await request(app)
        .get(`/api/orders/${sampleOrder._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.totalAmount).toBe(31.98);
    });

    it("should allow admin to view any user's order receipt by id", async () => {
      const res = await request(app)
        .get(`/api/orders/${sampleOrder._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
