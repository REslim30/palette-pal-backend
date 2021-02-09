import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
export async function postRegister(req: Request, res: Response) {
  if (req.get("Content-Type") !== "application/json")
    return res.sendStatus(415);
  try {
    const user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    const userDocument = await user.save();
    const {__v, password, ...result} = userDocument.toObject();
    return res.status(200).send(result);
  } catch(error) {
    return res.status(400).send({
      errors: error.errors
    });
  }
}

export async function getUsersMe(req: Request, res: Response) {
  return res.sendStatus(500);
}