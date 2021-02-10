import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { MongoError, ValidationError } from "mongoose/node_modules/mongodb";
import _ from "lodash";
import logger from "../util/logger";
export async function postRegister(req: Request, res: Response) {
  if (req.get("Content-Type") !== "application/json")
    return res.sendStatus(415);
  try {
    const user = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    const userDocument = await user.save();
    const { __v, password, ...result } = userDocument.toObject();
    return res.status(200).send(result);
  } catch (error) {
    switch (error.name) {
      case "ValidationError":
        Object.keys(error.errors).forEach((key) => {
          error.errors[key] = _.pick(error.errors[key], ["kind", "message"]);
        });
        return res.status(400).send({
          errors: error.errors,
        });
        
      case "MongoError":
        const errors: any = {}
        if (error.keyValue.username !== undefined)
          errors.username = { kind: "unique", message: "Username already exists." }
         
        if (error.keyValue.email !== undefined)
          errors.email = { kind: "unique", message: "email already exists." };
        
        return res.status(400).send({errors});
      
      default:
        return res.status(400).send("invalid user.");
    }
  }
}

export async function postLogin(req: Request, res: Response) {
  if (req.body.password === undefined || req.body.identifier === undefined)
    return res.status(400).send({message: "Missing identifer or password field"})
  
  const user = await User.findByIdentifier(req.body.identifier);
  if (user === null)
    return res.status(400).send({errorType: "invalid-credentials"})
  
  //now check password
  user.matchPassword(req.body.identifier)
    .then((isMatched) => {
      if (isMatched) {
        return res.status(200).send(user.toSendable());
      } else {

      }
    })
}

export async function getUsersMe(req: Request, res: Response) {
  return res.sendStatus(500);
}
