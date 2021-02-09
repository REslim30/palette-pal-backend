import { Palette, Color, PaletteDocument } from "../../src/models/Palette";
import mongoose from "mongoose";
import _ from "lodash";


describe("Palette document", () => {
  let db: mongoose.Connection;
  beforeAll(async () => {
    db = await connectToMongoDB();
  });

  afterAll(async () => {
    await db.close();
  });

  // Reset initializers
  let validPalette: PaletteDocument;
  let paletteInitalizer: Palette;
  beforeEach(() => {
    paletteInitalizer = getPaletteInitializer();
    validPalette = validPaletteDocument();
  });

  // Clean up database
  afterEach(async () => {
    await Palette.deleteMany({});
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
    })
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
    })
    
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  });

  test("should throw an error if shades are not a hex code", async () => {
    paletteInitalizer.colors[0].shades[0] = "FFFFFF";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
    paletteInitalizer.colors[0].shades[0] = "#12345";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
    paletteInitalizer.colors[0].shades[0] = "#ffgffa";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  })

  test("should throw an error if shades are empty", async () => {
    paletteInitalizer.colors[0].shades[0] = "";
    await expect(new Palette(paletteInitalizer).save()).rejects.toThrow();
  })

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

function getPaletteInitializer() {
  return {
    name: "test palette",
    colors: [
      {
        name: "name of color",
        shades: ["#FF00FF", "#123456"],
      },
    ],
  }
}

function validPaletteDocument() {
  return new Palette(getPaletteInitializer());
}

async function connectToMongoDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", () => {
    throw new Error("couldn't connect to database");
  });
  return db;
}