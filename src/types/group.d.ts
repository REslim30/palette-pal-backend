import * as mongoose from "mongoose";

declare global {
    type Group = {
      name: string;
      palettes: mongoose.Types.Array<string> | PaletteDocument[];
      user: string;
    }
  type GroupDocument = Group & mongoose.Document;
}
