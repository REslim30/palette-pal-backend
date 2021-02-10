import request from "supertest";
import app from "../../src/app";
import _ from "lodash";
import { User } from "../../src/models/User";
import jwt from "jsonwebtoken";
import ms from "ms";

describe("User routes", () => {
  let user: User;
  beforeEach(async () => {
    user = {
      username: "testUser18",
      password: "testUser18password",
      email: "testUser18@gmail.com",
    };

    await User.deleteMany({});
  });

  describe("/register", () => {
    test("Should 415 for non json content types", (done) => {
      request(app)
        .post("/register")
        .set("Content-Type", "text/plain")
        .send('{ identifer: "testUser18", password: "testUser18" }')
        .expect(415, done);
    });

    describe("after sending a user", () => {
      test("Should 200 for valid input", async () => {
        const res = await registerRequest().send(user).expect(200);

        const { _id, ...result } = res.body;
        expect(_.isMatch(user, result)).toBe(true);
        const users = await User.find({ _id });
        expect(users.length).toBe(1);
        expect(users[0].id).toBe(_id);
      });

      test("should provide a message for empty username", (done) => {
        user.username = "";

        registerRequest()
          .send(user)
          .expect(400, (err, res) => {
            if (err) done(err);
            expect(res.body.errors.username.kind).toBe("required");
            done();
          });
      });

      test("should provide a message for empty email", (done) => {
        user.email = "";

        registerRequest()
          .send(user)
          .expect(400, (err, res) => {
            if (err) done(err);
            expect(res.body.errors.email.kind).toBe("required");
            done();
          });
      });

      test("should provide a message for non-compliant RFC2822 email", async () => {
        user.email = "w@w";

        const res = await registerRequest().send(user).expect(400);

        expect(res.body.errors.email.kind).toBe("regexp");
      });

      test("should provide a message for not providing username", async () => {
        delete user.username;
        const res = await registerRequest().send(user).expect(400);

        expect(res.body.errors.username.kind).toBe("required");
        expect(res.body.errors.username.name).toBe(undefined);
      });

      test("should provide a message for not providing password", async () => {
        delete user.password;

        const res = await registerRequest().send(user).expect(400);

        expect(res.body.errors.password.kind).toBe("required");
      });

      test("should reject on duplicate username", async () => {
        const res = await registerRequest().send(user).expect(200);

        user.email = "differentEmail@gmail.com";

        const resSecond = await registerRequest().send(user).expect(400);

        expect(resSecond.body.errors.username.kind).toBe("unique");
      });

      test("should reject on duplicate email", async () => {
        await registerRequest().send(user).expect(200);

        user.username = "differentUsername";

        const res = await registerRequest().send(user).expect(400);

        expect(res.body.errors.email.kind).toBe("unique");
      });
    });
  });

  describe("/login", () => {
    function getUserLogin() {
      return {
        identifier: user.email,
        password: user.password
      }
    }
    // register
    beforeEach(async () => {
      await User.create(user);
    });

    test("should respond with 400 if missing identifier or password", async () => {
      const res = await loginRequest().send({}).expect(400);

      expect(res.body.message).toBe("Missing identifer or password field");
    });

    test('should respond with 400 and have errorType to be "invalid-credentials" if identifier doesn"t exist.', async () => {
      const userLogin = getUserLogin();
      userLogin.identifier = "invalidIdentifier"
      const res = await loginRequest().send(userLogin).expect(400);

      expect(res.body.errorType).toBe("invalid-credentials");
      expect(typeof res.body.message).toBe("string");
    });

    test("should respond with 200, a jwt and with user (excluding password) if credentials are valid", async () => {
      const userLogin = getUserLogin();

      const res = await loginRequest().send(userLogin).expect(200);

      const decoded = jwt.decode(res.body.jwt, { json: true });
      expect(decoded.sub).toBe(res.body.user._id);

      expect(_.isMatch(res.body.user, _.omit(user, ["password"]))).toBe(true);
      expect(res.body.user.password).toBe(undefined);
    });

    test("jwt should expire in 15 minutes", async () => {
      const res = await loginRequest().send(getUserLogin())
      .expect(200)

      const decoded = jwt.decode(res.body.jwt, {json: true,complete: true})
      expect(parseInt(decoded.payload.exp) * 1000).toBeGreaterThan(new Date().getTime() + ms('14m'));
    });

    test("should respond with 400, and invalid-credentials if invalid password", async () => {
      const userLogin = getUserLogin();
      userLogin.password = "invalidPassword"

      const res = await loginRequest().send(userLogin).expect(400);

      expect(res.body.errorType).toBe("invalid-credentials");
      expect(typeof res.body.message).toBe("string");
    });

    test("should respond with a refresh_token, set as a cookie with HttpOnly, sameSite=None, Secure", async () => {
      const userLogin = getUserLogin();

      const res = await loginRequest().send(userLogin).expect(200);

      console.log(res.header);
      expect(res.header['set-cookie']).toMatch(/refresh_token=/);
      expect(res.header['set-cookie']).toMatch(/Secure/);
      expect(res.header['set-cookie']).toMatch(/SameSite=None/);
      expect(res.header['set-cookie']).toMatch(/HttpOnly/);
    });
  });

  describe("/users/me", () => {
    beforeEach(async () => {
      await request(app).post("/register").send(user);
    });

    test("should respond with 401 if unauthorized", async () => {
      await request(app).get("/users/me").expect(401);
    });

    test("should respond with 200 and user without password if containing jwt in authorization header", async () => {
      const authRes = await request(app)
        .post("/login")
        .send({ identifier: user.email, password: user.password })
        .expect(200);

      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${authRes.body.jwt}`)
        .expect(200);

      expect(res.body.password).toBe(undefined);
      expect(_.isMatch(res.body, _.omit(user, ["password"])));
    });

    test("should respond with a 401 if expiry is past", async () => {
      const userDocument = await User.findOne({ email: user.email });
      const jwtString = jwt.sign({ sub: userDocument.id, exp: Math.trunc((new Date).getTime()/1000 - 5) }, process.env.ACCESS_TOKEN_SECRET)

      const authRes = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${jwtString}`)
        .expect(401);
    });
  });
});

function registerRequest() {
  return request(app).post("/register").set("Content-Type", "application/json");
}

function loginRequest() {
  return request(app).post("/login").set("Content-Type", "application/json");
}
