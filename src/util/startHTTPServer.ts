import fs from "fs";
import https from "https";
import logger from "./logger";

const key = fs.readFileSync("/etc/ssl/private/nginx-selfsigned.key");
const cert = fs.readFileSync("/etc/ssl/certs/nginx-selfsigned.crt");

export default function startHTTPSServer(app: any) {
  const server = https.createServer({key, cert}, app);
  server.listen(8443);
  logger.info("started https server on port 8443");
}