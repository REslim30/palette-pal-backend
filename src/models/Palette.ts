import mongoose from "mongoose";

export type PaletteDocument = mongoose.Document & {
  name: string;
  colors: ({ name: string; shades: string[] } & mongoose.Document)[];
};

const paletteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  colors: [
    {
      name: { type: String, required: true },
      shades: [String],
    },
  ],
});

export const Palette = mongoose.model<PaletteDocument>(
  "Palette",
  paletteSchema
);
