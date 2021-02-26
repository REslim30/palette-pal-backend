import { Palette, } from "../../src/models/Palette";
import mongoose from "mongoose";
import _ from "lodash";
import { connectToMongoDB } from "../util/connectToMongoDB";
import { PaletteInitializer } from "../util/PaletteInitializer";
import GroupInitializer from "../util/GroupInitializer";
import Group from "../../src/models/Group";

let db: mongoose.Connection;
beforeAll(async () => {
  db = await connectToMongoDB();
  await db.dropDatabase();
});

afterAll(async () => {
  await db.dropDatabase();
  await db.close();
});

describe("Palette document", () => {
  // Reset initializers
  let validPalette: PaletteDocument;
  let paletteInitalizer: PaletteInitializer;
  beforeEach(async () => {
    await Palette.deleteMany({});

    paletteInitalizer = new PaletteInitializer();
    paletteInitalizer.user = "randomUser";
    validPalette = new Palette(paletteInitalizer);
  });

  test("can be constructed", () => {});

  test("can access name", () => {
    expect(validPalette.name).toEqual(paletteInitalizer.name);
  });

  test("should throw an error when name is missing", async () => {
    delete paletteInitalizer.name;

    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("can access colors", () => {
    validPalette.colors.map((color, i) => {
      const paletteInitializerColor = paletteInitalizer.colors[i];
      const { _id, colorWithoutId } = color.toJSON();
      expect(_.isEqual(colorWithoutId, paletteInitializerColor));
    });
  });

  test("should throw an error when color name is missing", async () => {
    paletteInitalizer.colors = paletteInitalizer.colors.map((color: Color) => {
      delete color.name;
      return color;
    });

    await expect((new Palette(paletteInitalizer)).save()).rejects.toThrow();
  });

  test("should throw an error if palette name is empty", async () => {
    paletteInitalizer.name = "";

    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("should throw an error if color name is empty", async () => {
    paletteInitalizer.colors = paletteInitalizer.colors.map((color: Color) => {
      color.name = "";
      return color;
    });
    
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("should throw an error if shades are not a hex code", async () => {
    paletteInitalizer.colors[0].shades[0] = "FFFFFF";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
    paletteInitalizer.colors[0].shades[0] = "#12345";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
    paletteInitalizer.colors[0].shades[0] = "#ffgffa";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("should throw an error if shades are empty", async () => {
    paletteInitalizer.colors[0].shades[0] = "";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("should throw an error if user is empty", async () => {
    paletteInitalizer.user = undefined;
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("should throw if color is empty", async () => {
    paletteInitalizer.colors = [];
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("findOneAndUpdate should update colors", async () => {
    const palette = await new Palette(paletteInitalizer).save() as any;

    const paletteJSON = palette.toJSON();
    paletteJSON.colors = [
      {name: "new-color", shades: ["#ffaffa"]},
      {name: "second-color", shades: ["#abcdef"]}
    ];

    palette.set(paletteJSON);
    const newPalette = await palette.save();

    expect(_.isMatch(newPalette.colors, paletteJSON.colors)).toBe(true);
  });

  test("should have group field", async () => {
    const groupInitializer = new GroupInitializer();
    groupInitializer.user = "randomUser";
    const group = await Group.create(groupInitializer);
    paletteInitalizer.group = group.id;
    const palette = await new Palette(paletteInitalizer).save() as any;

    expect(palette.group.toString()).toBe(group.id);
  });

  describe("After saving to database", () => {
    let palette: PaletteDocument;
    let palettes: PaletteDocument[];
    beforeEach(async () => {
      palette = await validPalette.save();
      palettes = await Palette.find({});
    });

    test("should save to database", async () => {
      expect(palettes.length).toBe(1);
      expect(palette.equals(palettes[0])).toBe(true);
    });

    test("deleteOne should delete from database", async () => {
      await Palette.deleteOne({ _id: palette.id });
      palettes = await Palette.find({});
      expect(palettes.length).toBe(0);
    });

    test("set should update values non-desctructively", async () => {
      palette.set({ name: "New name" });
      await palette.save();
      palettes = await Palette.find({});

      expect(palettes.length).toBe(1);
      expect(palettes[0].equals(palette)).toBe(true);
      expect(palette.colors).toBeTruthy();
    });
  });
});
