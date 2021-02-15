import * as mongoose from "mongoose";

declare global {
    type Group = {
      name: string;
      palettes: string[];
      user: string;
    }
  type GroupDocument = Group & mongoose.Document;
}
