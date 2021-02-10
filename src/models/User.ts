import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { NextFunction } from "express";
import { identifier } from "@babel/types";

interface UserModel extends mongoose.Model<UserDocument> {
  findByIdentifier(identifier: string): Promise<UserDocument>
}

export type UserDocument = User & mongoose.Document;

export type User = {
  username: string;
  email: string;
  password: string;
};

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

  return user
}


export const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
