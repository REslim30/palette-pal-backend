import Group from "../models/Group";
import { Request, Response, NextFunction } from "express";
import checkJSON from "../middleware/checkJSON";
import { compose } from "compose-middleware";
import _ from "lodash";
import { Palette } from "../models/Palette";

export const postGroup = compose([checkJSON, postGroupHandler]);
export const getGroup = getGroupHandler;
export const getGroups = getGroupsHandler;
export const putGroup = putGroupHandler;
export const deleteGroup = deleteGroupHandler;

function postGroupHandler(req: Request, res: Response, next: NextFunction) {
  Group.create({
    user: req.user.sub,
    ..._.pick(req.body, ["name", "iconColor"]),
  })
    .then((group) => {
      return res.status(200).send(group.toJSON());
    })
    .catch((err) => {
      return res.status(400).send(err);
    });
}

async function getGroupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      user: req.user.sub,
    });
    if (!group)
      return res
        .status(400)
        .json({ message: "No group found for id: " + req.params.id });
    
    const result = group.toJSON();

    result.palettes = await Palette.find({ group: group.id });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json(err);
  };
}

async function getGroupsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await Group.find({user: req.user.sub});
    const groupsJSON = groups.map((group) => group.toJSON());
    const palettePromises = groups.map((group) => Palette.find({ group: group.id }));
    
    const groupPalettes = await Promise.all(palettePromises);
    const result = _.zipWith(groupsJSON, groupPalettes, (group, palettes) => {
      group.palettes = palettes;
      return group;
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
  }
}

function putGroupHandler(req: Request, res: Response, next: NextFunction) {
  Group.findOneAndUpdate(
    { _id: req.params.id, user: req.user.sub },
    { $set: req.body },
    { runValidators: true }
  )
    .then((group) => {
      if (!group)
        return res
          .status(400)
          .json({ message: "No group found for id: " + req.params.id });
      return res.status(200).json(group.toJSON());
    })
    .catch((err) => {
      return res.status(400).json(err);
    });
}

function deleteGroupHandler(req: Request, res: Response, next: NextFunction) {
  Group.findOneAndDelete({
    _id: req.params.id,
    user: req.user.sub,
  })
  .then((group) => {
    if (!group)
      return res.status(400).json({ message: "No group found for id: " + req.params.id });
    
    return res.status(200).json(group.toJSON());
  })
  .catch((err) => res.status(400).json(err));
}