import { NextFunction, Request, Response } from "express";

export default function checkJSON(req: Request, res: Response, next: NextFunction) {
  if (req.get("Content-Type") !== "application/json")
    return res.sendStatus(415);
  next();
}