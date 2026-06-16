const request = require("supertest");
require("./setup");
const { app } = require("../server");
const { cleanDatabase, closeDatabase } = require("./setup");
const Product = require("../models/Product");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

describe("Product Routes", () => {
  let userToken;
  let adminToken;
  let sampleProduct;

  beforeEach(async () => {
    await cleanDatabase();

    // Create a regular user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const user = await User.create({
      name: "Regular User",
      email: "user@example.com",
      password: hashedPassword,
      role: "USER",
    });

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    // Create tokens by calling login endpoints
    const userLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "password123" });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@example.com", password: "password123" });
    adminToken = adminLogin.body.token;

    // Seed a sample product
    sampleProduct = await Product.create({
      sku: "AAPL",
      title: "Apple iPhone 15",
      price: 999.99,
      category: "Electronics & Tech",
      stockQuantity: 100,
      description: "Consumer electronics smartphone.",
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe("GET /api/products", () => {
    it("should fetch all products successfully", async () => {
      const res = await request(app).get("/api/products");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
      expect(res.body.products[0].sku).toBe("AAPL");
    });

    it("should filter products by search keyword", async () => {
      // Add another product
      await Product.create({
        sku: "MSFT",
        title: "Microsoft Surface Book",
        price: 1499.0,
        category: "Electronics & Tech",
        description: "Surface Laptop."
      });

      const res = await request(app).get("/api/products?search=Apple");
      expect(res.statusCode).toBe(200);
      expect(res.body.products.length).toBe(1);
      expect(res.body.products[0].sku).toBe("AAPL");
    });
  });

  describe("GET /api/products/:id", () => {
    it("should get a product by id", async () => {
      const res = await request(app).get(`/api/products/${sampleProduct._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.sku).toBe("AAPL");
    });

    it("should return 404 for non-existent product id", async () => {
      const fakeId = "60c72b2f9b1d8e2e2c8d2038";
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/products (Admin Create)", () => {
    const newProduct = {
      sku: "GOOGL",
      title: "Google Pixel 8",
      price: 799.0,
      category: "Electronics & Tech",
      description: "Google Pixel Android Smartphone."
    };

    it("should allow admin to create a product", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.product.sku).toBe("GOOGL");
    });

    it("should reject creation from non-admin users", async () => {
      const res = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newProduct);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/products/:id (Admin Update)", () => {
    it("should allow admin to update a product", async () => {
      const res = await request(app)
        .put(`/api/products/${sampleProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          sku: "AAPL",
          title: "Apple iPhone 15 Updated",
          price: 949.99,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product.price).toBe(949.99);
    });

    it("should reject updates from non-admin users", async () => {
      const res = await request(app)
        .put(`/api/products/${sampleProduct._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          price: 949.99,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/products/:id (Admin Delete)", () => {
    it("should allow admin to delete a product", async () => {
      const res = await request(app)
        .delete(`/api/products/${sampleProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("removed successfully");
    });

    it("should reject delete from non-admin users", async () => {
      const res = await request(app)
        .delete(`/api/products/${sampleProduct._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
