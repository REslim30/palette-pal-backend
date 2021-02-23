import express from "express";
import compression from "compression";  // compresses requests
import cookieParser from "cookie-parser";
import session from "express-session";
import bodyParser from "body-parser";
import mongo from "connect-mongo";
import flash from "express-flash";
import mongoose from "mongoose";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";
import morgan from "morgan";
import cors from "cors";
import { jwtCheck } from "./config/auth";

const MongoStore = mongo(session);

// Controllers (route handlers)
import * as paletteController from "./controllers/palette";
import * as groupController from "./controllers/group";

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
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(cors()); 

const paletteRoutes = express.Router();
paletteRoutes.use(jwtCheck);
paletteRoutes.post("/", paletteController.postPalettes);
paletteRoutes.get("/", paletteController.getPalettes);
paletteRoutes.get("/:id", paletteController.getPalette);
paletteRoutes.put("/:id", paletteController.putPalette);
paletteRoutes.delete("/:id", paletteController.deletePalette);
app.use("/palettes", paletteRoutes);

const groupRoutes = express.Router();
groupRoutes.use(jwtCheck);
groupRoutes.post("/", groupController.postGroup);
groupRoutes.get("/:id", groupController.getGroup);
groupRoutes.get("/", groupController.getGroups);
groupRoutes.put("/:id", groupController.putGroup);
groupRoutes.delete("/:id", groupController.deleteGroup);
app.use("/groups", groupRoutes);
export default app;