import { Palette } from "../models/Palette";
import { Request, Response }  from "express";
import checkJSON from "../middleware/checkJSON";
import { compose } from "compose-middleware";
import { NextFunction } from "connect";

export const postPalettes = compose([checkJSON, postPalettesHandler]);
export function postPalettesHandler(req: Request, res: Response, next: NextFunction) {
  Palette.create({
    name: req.body.name,
    colors: req.body.colors,
  })
  .then((palette) => {
    return res.status(200).json(palette.toJSON());
  })
  .catch((err) => {
    return res.status(400).json(err);
  });
}