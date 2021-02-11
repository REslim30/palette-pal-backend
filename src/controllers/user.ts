import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../models/User";
import jwt from "jsonwebtoken";
import _ from "lodash";
import logger from "../util/logger";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../util/secrets";
import { compose }  from "compose-middleware";
import refreshTokenRegistry from "../util/refreshTokenRegistry";

export const postRegister = compose([checkJSON, postRegisterErrorHandler, loginSucess]);
export const postLogin = compose([checkJSON, postLoginHandler, loginSucess]);
export { getUsersMe, getRefreshToken };

function checkJSON(req: Request, res: Response, next: NextFunction) {
  if (req.get("Content-Type") !== "application/json")
    return res.sendStatus(415);
  next();
}

async function postRegisterErrorHandler(req: Request, res: Response, next: NextFunction) {
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
      .send({ message: "Missing identifier or password field" });

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
  res.cookie("refresh_token", jwt.sign({ sub: user.id }, REFRESH_TOKEN_SECRET), {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  refreshTokenRegistry.register(user.id);
  return res.status(200).send({
    jwt: jwt.sign({ sub: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    }),
    user: user.toSendable(),
  });
}

function getRefreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies["refresh_token"];
  if (refreshToken === undefined)
    return res.sendStatus(401);
  
  let payload: any;
  try {
    payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return res.sendStatus(401);
  }

  if (!refreshTokenRegistry.verify(payload.sub))
    return res.sendStatus(401);
  
  res.sendStatus(200);
}

async function getUsersMe(req: Request, res: Response) {
  return res.status(200).send((req.user as UserDocument).toSendable());
}
