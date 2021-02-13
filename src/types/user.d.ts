import * as mongoose from "mongoose";

declare global {
   type User = {
    username: string;
    email: string;
    password: string;
  };
  type UserDocument = User & mongoose.Document & {
    matchPassword(password: string): Promise<boolean>;
    toSendable(): Omit<User, "password">;
  };
  interface UserModel extends mongoose.Model<UserDocument> {
    findByIdentifier(identifier: string): Promise<UserDocument>;
  }
}
