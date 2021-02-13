import ms from "ms";
import redis from "redis";
import { promisify } from "util";
import { REDIS_URL } from "../util/secrets";

const client = redis.createClient(REDIS_URL);
const setexAsync = promisify(client.setex).bind(client);
const existsAsync = promisify(client.exists).bind(client);
const delAsync = promisify(client.del).bind(client);
export function verify(userId: string): Promise<boolean> {
  if (userId === undefined) return Promise.resolve(false);
  return existsAsync(userId).then((value: any) => Boolean(value));
}

export function register(userId: string): Promise<void> {
  return setexAsync(userId, ms("30d")/1000, 1);
}

export function remove(userId: string): Promise<void> {
  return delAsync(userId);
}

export default {
  verify,
  register,
  remove
};