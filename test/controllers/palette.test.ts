import request from "supertest";
import app from "../../src/app";

describe("Palette routes", () => {
  describe("POST /palettes (CREATE)", () => {
    test("should respond 401 if not logged in", () => {
      return request(app)
        .post('/palettes')
        .send({})
        .expect(401);
    });
  })
})