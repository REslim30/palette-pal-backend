import mongoose, { Schema } from "mongoose";
import toJSONOptions from "./util/toJSONOptions";

const groupSchema = new Schema({
  name: { type: String, required: true },
  user: { type: String, required: true },
  iconColor: { type: String }
});

groupSchema.set("toJSON", toJSONOptions);

export default mongoose.model<GroupDocument>("Group", groupSchema);