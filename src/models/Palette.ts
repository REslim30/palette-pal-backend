import mongoose from "mongoose";

export type PaletteDocument = mongoose.Document & {
  name: String
}

const paletteSchema = new mongoose.Schema({
  name: String,
})

export const Palette = mongoose.model<PaletteDocument>('Palette', paletteSchema);