import Group from "../models/Group";
import { Request, Response, NextFunction } from "express";
import checkJSON from "../middleware/checkJSON";
import { compose } from "compose-middleware";
import _ from "lodash";

export const postGroup = compose([checkJSON, postGroupHandler]);
export const getGroup = getGroupHandler;

function postGroupHandler(req: Request, res: Response, next: NextFunction) {
  Group.create({
    user: req.user._id,
    ..._.pick(req.body, ['name', 'palettes'])
  })
  .then((group) => {
    return res.status(200).send(group.toJSON());
  })
  .catch((err) => {
    return res.status(400).send(err);
  })
}

function getGroupHandler(req: Request, res: Response, next: NextFunction) {
  Group.findOne({
    _id: req.params.id,
    user: req.user.id
  })
  .then((group) => {
    if (!group)
      return res.status(400).json({ message: "No group found for id: " + req.params.id })

    return res.status(200).json(group.toJSON());
  })
  .catch((err) => {
    return res.status(400).json(err)
  })
}