import mongoose from "mongoose";

export type Palette = {
  name: string,
  colors: Color[],
};

export type Color = {
  name: string,
  shades: string[],
};
export type PaletteDocument = mongoose.Document & {
  name: string;
  colors: (Color & mongoose.Document)[];
};

const paletteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  colors: [
    {
      name: { type: String, required: true },
      shades: [
        { type: String, match: /^#[a-fA-F0-9]{6}$/, required: true },
      ],
    },
  ],
});

export const Palette = mongoose.model<PaletteDocument>(
  "Palette",
  paletteSchema
);
