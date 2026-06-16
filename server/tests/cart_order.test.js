const request = require("supertest");
require("./setup");
const { app } = require("../server");
const { cleanDatabase, closeDatabase } = require("./setup");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");

describe("Cart and Order Routes", () => {
  let token;
  let user;
  let product;

  beforeEach(async () => {
    await cleanDatabase();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    user = await User.create({
      name: "Shopper Doe",
      email: "shopper@example.com",
      password: hashedPassword,
      balance: 1000, // $1,000 wallet balance
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "shopper@example.com", password: "password123" });
    token = loginRes.body.token;

    product = await Product.create({
      sku: "TSLA",
      title: "Tesla Cyberwhistle",
      price: 50.0,
      category: "Merchandise",
      stockQuantity: 10,
      description: "Collectible whistle."
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe("Cart Operations", () => {
    it("should successfully retrieve an empty cart", async () => {
      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items.length).toBe(0);
    });

    it("should add a product to the cart", async () => {
      const res = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id.toString(),
          quantity: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items.length).toBe(1);
      expect(res.body.cart.items[0].product._id).toBe(product._id.toString());
      expect(res.body.cart.items[0].quantity).toBe(2);
    });

    it("should update a product quantity in the cart", async () => {
      // Add first
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id.toString(), quantity: 1 });

      const res = await request(app)
        .post("/api/cart/update")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id.toString(),
          quantity: 5
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items[0].quantity).toBe(5);
    });

    it("should remove a product from the cart", async () => {
      // Add first
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id.toString(), quantity: 1 });

      const res = await request(app)
        .post("/api/cart/remove")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id.toString()
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items.length).toBe(0);
    });
  });

  describe("Checkout Operations", () => {
    beforeEach(async () => {
      // Pre-add item to cart
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id.toString(), quantity: 3 }); // Total cost = $150
    });

    it("should successfully checkout and place an order", async () => {
      const res = await request(app)
        .post("/api/orders/checkout")
        .set("Authorization", `Bearer ${token}`)
        .send({
          shippingAddress: "123 ShopEZ Lane, Retail City"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order.totalAmount).toBe(150.0);
      expect(res.body.order.shippingAddress).toBe("123 ShopEZ Lane, Retail City");
      expect(res.body.order.status).toBe("PENDING");

      // Verify wallet balance deduction
      const userRecord = await User.findById(user._id);
      expect(userRecord.balance).toBe(850.0); // 1000 - 150

      // Verify inventory deduction
      const productRecord = await Product.findById(product._id);
      expect(productRecord.stockQuantity).toBe(7); // 10 - 3

      // Verify cart is cleared
      const cartRecord = await Cart.findOne({ user: user._id });
      expect(cartRecord.items.length).toBe(0);
    });

    it("should reject checkout if shipping address is missing", async () => {
      const res = await request(app)
        .post("/api/orders/checkout")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("address is required");
    });

    it("should reject checkout if user balance is insufficient", async () => {
      // Set product price to high
      await Product.findByIdAndUpdate(product._id, { price: 500 }); // 3 * 500 = 1500 (balance is 1000)

      const res = await request(app)
        .post("/api/orders/checkout")
        .set("Authorization", `Bearer ${token}`)
        .send({ shippingAddress: "123 Street" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Insufficient wallet credit");
    });

    it("should reject checkout if product inventory is insufficient", async () => {
      // Update quantity to exceed stock quantity
      await request(app)
        .post("/api/cart/update")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id.toString(), quantity: 15 }); // Stock is 10

      const res = await request(app)
        .post("/api/orders/checkout")
        .set("Authorization", `Bearer ${token}`)
        .send({ shippingAddress: "123 Street" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Insufficient stock");
    });
  });
});
