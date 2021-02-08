import { Palette, PaletteDocument } from "../../src/models/Palette";
import mongoose from "mongoose";

const paletteInitalizer = {
  name: "test palette",
};

function validPaletteDocument() {
  return new Palette(paletteInitalizer);
}

describe("Palette document", () => {
  let db: mongoose.Connection;
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    db = mongoose.connection;
    db.on('error', () => {
      throw new Error("couldn't connect to database");
    })
  });

  afterAll(async () => {
    await db.close();
  });

  let validPalette: PaletteDocument;
  beforeEach(() => {
    validPalette = validPaletteDocument();
  });

  afterEach(async () => {
    // Clean up database
    const del = await Palette.deleteMany({});
    console.log(3);
  })

  test("can be constructed", () => {});

  test("can access name", () => {
    expect(validPalette.name).toEqual(paletteInitalizer.name);
  });

  test("can save to the database", async () => {
    const palette = await validPalette.save();
    const palettes = await Palette.find({});

    expect(palettes.length).toBe(1);
    expect(palette.equals(palettes[0])).toBe(true);
  });
});
