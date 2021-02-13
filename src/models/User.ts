import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";
import _ from "lodash";
import toJSONOptions from "./util/toJSONOptions";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash passwords before saving
userSchema.pre("save", function (this: UserDocument, next: NextFunction) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10, (err: Error, hashedPassword) => {
    if (err) return next(err);
    this.password = hashedPassword;
    next();
  });
});

// find user by identifier (email first then username)
userSchema.statics.findByIdentifier = async function (this: mongoose.Model<UserDocument>, identifier: string) {
  let user = await this.findOne({ email: identifier });

  if (user === null)
    user = await this.findOne({ username: identifier });

  return user;
};

userSchema.methods.matchPassword = async function (this: UserDocument, password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.toSendable = function (this: UserDocument) {
  return _.omit(this.toObject(), ["password", "__v"]);
};

userSchema.set("toJSON", toJSONOptions);

export const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
