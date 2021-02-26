import Group from "../../src/models/Group";
import { Palette } from "../../src/models/Palette";
import { PaletteInitializer } from "../util/PaletteInitializer";
import { UserInitializer } from "../util/UserInitializer";
import { connectToMongoDB } from "../util/connectToMongoDB";
import mongoose from "mongoose";

let db: mongoose.Connection;
beforeAll(async () => {
  db = await connectToMongoDB();
  await db.dropDatabase();
});

afterAll(async () => {
  await db.dropDatabase();
  await db.close();
});

describe("Group Model", () => {
  let groupInitializer: any;
  let palette1: PaletteDocument;
  let palette2: PaletteDocument;
  beforeEach(async () => {
    palette1 = new Palette(new PaletteInitializer({user: "testUser"}));
    palette2 = new Palette(new PaletteInitializer({ user: "testUser" }));
    groupInitializer = { 
      name: "testGroup",
      palettes: [palette1.id, palette2.id],
      user: "testUser"
    };
  });
  
  test("should have a name field", () => {
    const group = new Group(groupInitializer);

    expect(group.name).toBe("testGroup");
  });

  test("name field should be required", () => {
    groupInitializer.name = "";

    return expect(new Group(groupInitializer).validate()).rejects.toThrow();
  });

  test("should have a users field", () => {
    const group = new Group(groupInitializer);

    expect(group.user.toString()).toBe("testUser");
  });

  test("users field should be required", () => {
    groupInitializer.user = undefined;
    const group = new Group(groupInitializer);
    return expect(group.validate()).rejects.toThrow();
  });

  test("toJSON output should have id instead of _id", () => {
    const group = new Group(groupInitializer);
    const groupJSON = group.toJSON();

    expect(groupJSON.id.toString()).toBe(group.id);
    expect(groupJSON._id).toBe(undefined);
  });
});