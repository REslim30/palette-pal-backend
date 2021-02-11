import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
} 

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const MONGODB_URI = (prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"]) as string;


if (!MONGODB_URI) {
    if (prod) {
        logger.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        logger.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}

// jwt access token secret
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
if (!ACCESS_TOKEN_SECRET) {
    logger.error("No access token secret. set ACCESS_TOKEN_SECRET environment variable");
    process.exit(1);
}

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
if (!REFRESH_TOKEN_SECRET) {
    logger.error("No refresh token secret. set REFRESH_TOKEN_SECRET environment variable");
    process.exit(1);
}

export const REDIS_URL = prod ? process.env.REDIS_URL : undefined;
if (!REDIS_URL) {
    logger.error("No redis url available. set REDIS_URL environment variable");
    process.exit(1);
}