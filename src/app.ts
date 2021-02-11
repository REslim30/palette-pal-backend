import express from "express";
import compression from "compression";  // compresses requests
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";
import passport from "./config/passport";
import morgan from "morgan";
import cors from "cors";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as userController from "./controllers/user";


// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } ).then(
    () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`);
    // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(morgan("tiny"));
app.use(cors({ origin: ["https://playcode.io"], credentials: true })); // TODO tighten cors policies to select few sites
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Authentication routes
app.post("/register", userController.postRegister);
app.get("/users/me", passport.authenticate("jwt", { session: false }), userController.getUsersMe);
app.post("/login", userController.postLogin);
export default app;