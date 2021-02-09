import request from "supertest";
import app from "../../src/app";

describe("User routes", () => {
  describe("/register", () => {
    test("Can register", (done) => {
      request(app)
        .post("/register")
        .send({ identifer: "testUser18", password: "testUser18" })
        .expect(200, done);
    });
  })

});
