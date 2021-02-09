import { UserDocument, User } from "../../src/models/User";
import mongoose from "mongoose";
import { connectToMongoDB } from "../util/connectToMongoDB";
import bcrypt from "bcrypt";

describe("User model", () => {
  let db: mongoose.Connection;
  beforeAll(async () => {
    db = await connectToMongoDB();
  });

  afterAll(async () => {
    await db.close();
  });

  // Clean up database
  afterEach(async () => {
    await User.deleteMany({});
  });
  
  let validUser: UserDocument;
  let userInitializer: User;
  beforeEach(() => {
    validUser = new User(getUserInitializer());
    userInitializer = getUserInitializer();
  });

  test("should have a username field", () => {
    expect(validUser.username).toBe(userInitializer.username);
  });

  test("should throw if username field is empty", async () => {
    validUser.username = "";

    await expect(validUser.save()).rejects.toThrow();
  })

  test("should have an email field", () => {
    expect(validUser.email).toBe(userInitializer.email);
  })

  test("should throw if email field is empty", async () => {
    validUser.email = "";
    await expect(validUser.save()).rejects.toThrow();
  })

  test("should throw if email is an invalid email", async () => {
    validUser.email = "randomstring"
    await expect(validUser.save()).rejects.toThrow();
    validUser.email = "ok@ok"
    await expect(validUser.save()).rejects.toThrow();
  });

  test("should have an password field", () => {
    expect(validUser.password).toBe(userInitializer.password);
  });

  test("should throw if password is empty", async () => {
    validUser.password = "";
    await expect(validUser.save()).rejects.toThrow();
  })

  test("should save password as hash", async (done) => {
    const user = await validUser.save()
    expect(user.password).not.toBe(userInitializer.password);

    await bcrypt.compare(userInitializer.password, user.password);
  });
});

function getUserInitializer() {
  return {
    username: "testUser18",
    email: "testUser18@gmail.com",
    password: "testUser18"
  }
}