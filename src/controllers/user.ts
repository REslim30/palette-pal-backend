import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import _ from "lodash";
import logger from "../util/logger";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../util/secrets";
import { identifier } from "@babel/types";
import { compose }  from "compose-middleware";
import { nextTick } from "async";

export const postRegister = compose([postRegisterErrorHandler, loginSucess]);
export const postLogin = compose([postLoginHandler, loginSucess]);
export { getUsersMe };

async function postRegisterErrorHandler(req: Request, res: Response, next: NextFunction) {
  if (req.get("Content-Type") !== "application/json")
    return res.sendStatus(415);
  
  const user = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });
  user.save()
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
    switch (error.name) {
      case "ValidationError":
        Object.keys(error.errors).forEach((key) => {
          error.errors[key] = _.pick(error.errors[key], ["kind", "message"]);
        });
        return res.status(400).send({
          errors: error.errors,
        });

      case "MongoError":
        const errors: any = {};
        if (error.keyValue.username !== undefined)
          errors.username = {
            kind: "unique",
            message: "Username already exists.",
          };

        if (error.keyValue.email !== undefined)
          errors.email = { kind: "unique", message: "email already exists." };

        return res.status(400).send({ errors });

      default:
        return res.status(400).send("invalid user.");
    }
  });
}

async function postLoginHandler(req: Request, res: Response, next: NextFunction) {
  if (
    typeof req.body.password !== "string" ||
    typeof req.body.identifier !== "string"
  )
    return res
      .status(400)
      .send({ message: "Missing identifer or password field" });

  const user = await User.findByIdentifier(req.body.identifier);
  if (user === null)
    return res.status(400).send({
      errorType: "invalid-credentials",
      message: "invalid password or identifier",
    });

  user.matchPassword(req.body.password).then((isMatched) => {
    if (isMatched) {
      req.user = user;
      next();
    } else {
      return res.status(400).send({
        errorType: "invalid-credentials",
        message: "invalid password or identifier",
      });
    }
  });
}

function loginSucess(req: Request, res: Response) {
  const user = req.user as UserDocument;
  res.cookie("refresh_token", jwt.sign({}, REFRESH_TOKEN_SECRET), {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  return res.status(200).send({
    jwt: jwt.sign({ sub: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    }),
    user: user.toSendable(),
  });
}

async function getUsersMe(req: Request, res: Response) {
  return res.status(200).send((req.user as UserDocument).toSendable());
}
