import mongoose from "mongoose";
declare global {
  type Palette = {
    name: string;
    colors: Color[];
  };

  type Color = {
    name: string;
    shades: string[];
  };
  type PaletteDocument = mongoose.Document & {
    name: string;
    colors: (Color & mongoose.Document)[];
  };
}