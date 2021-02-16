import Group from "../../src/models/Group";
import { Palette } from "../../src/models/Palette";
import { PaletteInitializer } from "../util/PaletteInitializer";
import { User } from "../../src/models/User";
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
  let user: UserDocument;
  beforeEach(async () => {
    user = new User(new UserInitializer());
    palette1 = new Palette(new PaletteInitializer({user: user.id}));
    palette2 = new Palette(new PaletteInitializer({ user: user.id }));
    groupInitializer = { 
      name: "testGroup",
      palettes: [palette1.id, palette2.id],
      user: user.id
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

  test("should have a palettes field", () => {
    const group = new Group(groupInitializer);

    expect(group.palettes.includes(palette1.id)).toBe(true);
    expect(group.palettes.includes(palette2.id)).toBe(true);
  });

  test("should have a users field", () => {
    const group = new Group(groupInitializer);

    expect(group.user.toString()).toBe(user.id);
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

  test("Model should be able to populate fields successfully", async () => {
    await palette1.save();
    await palette2.save();
    await user.save();
    const group = new Group(groupInitializer);
    await group.save();

    const groupQuery = await Group.findById(group.id).populate("palettes");
    expect((groupQuery.palettes[0] as PaletteDocument).toJSON()).toStrictEqual(palette1.toJSON());
    expect((groupQuery.palettes[1] as PaletteDocument).toJSON()).toStrictEqual(palette2.toJSON());
  });
});