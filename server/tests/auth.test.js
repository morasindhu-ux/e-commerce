const request = require("supertest");
require("./setup");
const { app } = require("../server");
const { cleanDatabase, closeDatabase } = require("./setup");
const User = require("../models/User");

describe("Authentication Routes", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  const userData = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.name).toBe(userData.name);
    });

    it("should fail validation with invalid inputs", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "",
          email: "invalid-email",
          password: "123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail if user already exists", async () => {
      // Register first user
      await request(app).post("/api/auth/register").send(userData);

      // Register second user with same email
      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login registered user successfully", async () => {
      // Register user
      await request(app).post("/api/auth/register").send(userData);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
    });

    it("should fail to login with wrong credentials", async () => {
      await request(app).post("/api/auth/register").send(userData);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "wrongpassword",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Protected Auth Routes", () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(userData);
      token = res.body.token;
    });

    it("GET /api/auth/me should fetch current user profile", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(userData.email);
    });

    it("GET /api/auth/profile should get user profile info", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(userData.email);
    });

    it("PUT /api/auth/profile should update user details", async () => {
      const res = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Updated",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe("John Updated");
    });

    it("POST /api/auth/logout should return success message", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Logout successful");
    });

    it("should block requests without valid token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
