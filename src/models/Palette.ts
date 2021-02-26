import mongoose, { Schema, SchemaTypes } from "mongoose";
import toJSONOptions from "./util/toJSONOptions";


const paletteSchema = new Schema({
  name: { type: String, required: true },
  colors: {
    type: [{
      name: { type: String, required: true },
      shades: [
        { type: String, match: /^#[a-fA-F0-9]{6}$/, required: true },
      ],
    }],
    validate: {
      validator: (arr: any[]) => arr.length >= 1,
      message: (props: any) => `${props.path} must be greater than 1.`,
    }
  },
  user: { type: String, required: true },
  group: { type: Schema.Types.ObjectId, ref: "Group" }
});

paletteSchema.set("toJSON", toJSONOptions);

export const Palette = mongoose.model<PaletteDocument>(
  "Palette",
  paletteSchema
);
