import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";

passport.use(new LocalStrategy(authenticateUser))

function authenticateUser(identifer: string, password: string, done: Function) {

}