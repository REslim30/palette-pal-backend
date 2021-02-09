import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";

export type User = {
  username: string;
  email: string;
  password: string;
};

export type UserDocument = User & mongoose.Document;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash passwords before saving
userSchema.pre("save", function (this: UserDocument, next: NextFunction) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.hash(user.password, 10, (err: Error, hashedPassword) => {
    if (err) return next(err);
    user.password = hashedPassword;
    next();
  });
});

export const User = mongoose.model<UserDocument>("User", userSchema);
