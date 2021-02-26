import Group from "../models/Group";
import { Request, Response, NextFunction } from "express";
import checkJSON from "../middleware/checkJSON";
import { compose } from "compose-middleware";
import _ from "lodash";
import { Palette } from "src/models/Palette";

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
    })
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

function getGroupsHandler(req: Request, res: Response, next: NextFunction) {
  Group.find({user: req.user.sub}).then((groups) => {
    return res.status(200).json(groups.map((group) => group.toJSON()));
  });
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