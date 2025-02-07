import { Palette } from "../models/Palette";
import { Request, Response, NextFunction } from "express";
import checkJSON from "../middleware/checkJSON";
import { compose } from "compose-middleware";

export const postPalettes = compose([checkJSON, postPalettesHandler]);
export const getPalette = getPaletteHandler;
export const getPalettes = getPalettesHandler;
export const putPalette = putPaletteHandler;
export const deletePalette = deletePaletteHandler;

function postPalettesHandler(req: Request, res: Response, next: NextFunction) {
  Palette.create({
    name: req.body.name,
    colors: req.body.colors,
    group: req.body.group,
    user: req.user.sub,
  })
    .then((palette) => {
      return res.status(200).json(palette.toJSON());
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
}

function getPaletteHandler(req: Request, res: Response, next: NextFunction) {
  Palette.findOne({
    _id: req.params.id,
    user: req.user.sub,
  })
    .then((palette) => {
      if (palette === null)
        return res
          .status(400)
          .json({ message: "No palette found for id: " + req.params.id });

      return res.status(200).json(palette.toJSON());
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
}

function getPalettesHandler(req: Request, res: Response, next: NextFunction) {
  Palette.find({
    user: req.user.sub,
  }).then((palettes) => {
    return res.status(200).json(palettes.map((palette) => palette.toJSON()));
  });
}

function putPaletteHandler(req: Request, res: Response, next: NextFunction) {
  Palette.findOneAndUpdate(
    {
      user: req.user.sub,
      _id: req.params.id,
    },
    req.body,
    { runValidators: true }
  )
    .then((palette) => {
      if (!palette)
        return res
          .status(400)
          .json({ message: "No palette found for id: " + req.params.id });

      return res.status(200).json(palette.toJSON());
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
}

function deletePaletteHandler(req: Request, res: Response, next: NextFunction) {
  Palette.findOneAndDelete({
    user: req.user.sub,
    _id: req.params.id,
  })
    .then((palette) => {
      if (!palette)
        return res
          .status(400)
          .json({ message: "No palette found for id: " + req.params.id });

      return res.status(200).json(palette.toJSON());
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
}
