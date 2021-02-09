import {
  Strategy as JWTStrategy,
  ExtractJwt as ExtractJWT,
} from "passport-jwt";
import passport from "passport";

// JWT strategy
passport.use(new JWTStrategy({
  secretOrKey: 'secret', //TODO get better secret
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
}, authenticateUser));

function authenticateUser(
  jwtPayload: any,
  done: Function
) {

}
