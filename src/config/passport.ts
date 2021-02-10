import {
  Strategy as JWTStrategy,
  ExtractJwt as ExtractJWT,
} from "passport-jwt";
import passport from "passport";
import { User } from "../models/User";
import logger from "../util/logger";
import { ACCESS_TOKEN_SECRET } from "../util/secrets";

// JWT strategy
passport.use(new JWTStrategy({
  secretOrKey: ACCESS_TOKEN_SECRET,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
}, authenticateUser));

function authenticateUser(jwtPayload: any, done: Function) {
  User.findById(jwtPayload.sub, (err, user) => {
    if (err) return done(err, false);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
}

export default passport;