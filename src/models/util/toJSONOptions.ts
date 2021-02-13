import mongoose from "mongoose";
export default {
  transform: (doc: mongoose.Document, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
  versionKey: false,
};