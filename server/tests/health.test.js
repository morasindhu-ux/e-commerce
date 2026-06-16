const request = require("supertest");
require("./setup");
const { app } = require("../server");
const { closeDatabase } = require("./setup");

describe("Server Health and Middleware Tests", () => {
  afterAll(async () => {
    await closeDatabase();
  });

  it("GET / should return 200 and health message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "ShopEZ E-Commerce API Running",
    });
  });

  it("GET /non-existent-route should return 404 error", async () => {
    const res = await request(app).get("/api/non-existent");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Not Found");
  });
});
