import { User } from "../../src/models/User";
import mongoose from "mongoose";
import { MongoError, ValidationError } from "mongoose/node_modules/mongodb";
import { connectToMongoDB } from "../util/connectToMongoDB";
import bcrypt from "bcrypt";
import _ from "lodash";
import { UserInitializer } from "../util/UserInitializer";

let db: mongoose.Connection;
beforeAll(async () => {
  db = await connectToMongoDB();
});

afterAll(async () => {
  await db.dropDatabase();
  await db.close();
});

describe("User model", () => {
  let validUser: UserDocument;
  let userInitializer: User;
  beforeEach(async () => {
    validUser = new User(new UserInitializer());
    userInitializer = new UserInitializer();
    await User.deleteMany({});
  });

  test("should have a username field", () => {
    expect(validUser.username).toBe(userInitializer.username);
  });

  test("should throw if username field is empty", async () => {
    validUser.username = "";

    await expect(validUser.save()).rejects.toThrow();
  });

  test("should have an email field", () => {
    expect(validUser.email).toBe(userInitializer.email);
  });

  test("should throw if email field is empty", async () => {
    validUser.email = "";
    await expect(validUser.save()).rejects.toThrow();
  });

  test("should throw if email is an invalid email", async () => {
    validUser.email = "randomstring";
    await expect(validUser.save()).rejects.toThrow();
    validUser.email = "ok@ok";
    await expect(validUser.save()).rejects.toThrow();
  });

  test("should have an password field", () => {
    expect(validUser.password).toBe(userInitializer.password);
  });

  test("should throw if password is empty", async () => {
    validUser.password = "";
    await expect(validUser.save()).rejects.toThrow(ValidationError);
  });

  test("should save password as hash", async () => {
    const user = await validUser.save();
    expect(user.password).not.toBe(userInitializer.password);

    const result = await bcrypt.compare(userInitializer.password, user.password);
    expect(result).toBe(true);
  });

  test("should throw if username is duplciate", async () => {
    await User.create(userInitializer);
    userInitializer.email = "different@email.com";
    await expect(User.create(userInitializer)).rejects.toThrow(MongoError);
  });

  test("should throw if email is duplicate", async () => {
    await new User(userInitializer).save();
    userInitializer.username = "differentUsername";
    await expect(new User(userInitializer).save()).rejects.toThrow(MongoError);
  });

  describe("findByIdentifier", () => {
    test("should be able to search using email identifier", async () => {
      const initialUser = await new User(userInitializer).save();
      const user = User.findByIdentifier(userInitializer.email);
      expect((await user).equals(initialUser)).toBe(true);
    });

    test("should be able to search using email identifier", async () => {
      const initialUser = await new User(userInitializer).save();
      const user = User.findByIdentifier(userInitializer.username);
      expect((await user).equals(initialUser)).toBe(true);
    });

    test("should return null if identifier doesn't exist", async () => {
      const initialUser = await new User(userInitializer).save();
      const user = User.findByIdentifier("doesntexistidentifier");
      expect(user).resolves.toBe(null);
    });

  });
  describe("UserDocument.prototype.matchPassword()", () => {
    test("should return true if correct password", async () => {
      const user = await new User(userInitializer).save();
      await expect(user.matchPassword(userInitializer.password)).resolves.toBe(true);
    });

    test("should return true if incorrect password", async () => {
      const user = await new User(userInitializer).save();
      await expect(user.matchPassword("incorrect-password")).resolves.toBe(false);
    });
  });
  describe("UserDocument.prototype.toJSON()", () => {
    test("should return object without password", async () => {
      const user = await new User(userInitializer).save();
      const sendableUser = user.toSendable();
      expect(_.isMatch(user, _.omit(sendableUser,"id"))).toBe(true);
      expect((sendableUser as any).password).toBe(undefined);
    });
  });
});