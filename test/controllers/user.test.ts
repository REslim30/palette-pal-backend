import request from "supertest";
import app from "../../src/app";
import _ from "lodash";
import { User } from "../../src/models/User";
import { response } from "express";

describe("User routes", () => {
  describe("/register", () => {
    let user: User;

    beforeEach(() => {
      user = {
        username: "testUser18",
        password: "testUser18",
        email: "testUser18@gmail.com"
      };
    });

    test("Should 415 for non json content types", (done) => {
      request(app)
        .post("/register")
        .set("Content-Type", "text/plain")
        .send("{ identifer: \"testUser18\", password: \"testUser18\" }")
        .expect(415, done);
    });

    describe("after sending a user", () => {
      let userRequest: request.Test;
      beforeEach(() => {
        userRequest = request(app)
          .post("/register")
          .set("Content-Type", "application/json");
      });

      test("Should 200 for valid input", async () => {
        const res = await userRequest
          .send(user)
          .expect(200);

        const {_id, ...result} = res.body;
        expect(_.isMatch(user, result)).toBe(true);
        const users = await User.find({ _id });
        expect(users.length).toBe(1);
        expect(users[0].id).toBe(_id);
      });

      test("should provide a message for empty username", (done) => {
        user.username = "";

        userRequest
          .send(user)
          .expect(400, (err, res) => {
            if (err) done(err);
            expect(res.body.errors.username.kind).toBe("required");
            done();
          });
      });

      test("should provide a message for empty email", (done) => {
        user.email = "";

        userRequest
          .send(user)
          .expect(400, (err, res) => {
            if (err) done(err);
            expect(res.body.errors.email.kind).toBe("required");
            done();
          });
      });

      test("should provide a message for non-compliant RFC2822 email", async () => {
        user.email = "w@w";

        const res = await userRequest
          .send(user)
          .expect(400);

        expect(res.body.errors.email.kind).toBe("regexp");
      });

      test("should provide a message for not providing username", async () => {
        delete user.username;
        const res = await userRequest
          .send(user)
          .expect(400);
        
        expect(res.body.errors.username.kind).toBe("required");
      });

      test("should provide a message for not providing password", async () => {
        delete user.password;

        const res = await userRequest
          .send(user)
          .expect(400);

        expect(res.body.errors.password.kind).toBe("required");
      });
    });
  });

  describe("/login", () => {
    
  });

  describe("/users/me", () => {
    test("should respond with 401 if unauthorized", async () => {
      await request(app)
        .get("/users/me")
        .expect(401);
    });
  });
});
