import ms from "ms";
import redis from "redis";

const client = redis.createClient();
type RefreshToken = {
  expires: Date;
};
const refreshTokenRegistry = new Map<string, RefreshToken>();
export function verify(userId: string): boolean {
  if (!refreshTokenRegistry.has(userId))
    return false;
  
  if (refreshTokenRegistry.get(userId).expires < new Date())
    return false;

  return true;
}

export function register(userId: string): void {
  refreshTokenRegistry.set(userId, { expires: getExpiry() });
}

export function clear(): void {
  refreshTokenRegistry.clear();
}

function getExpiry(): Date {
  return new Date(new Date().getTime() + ms("30d"));
}

export default {
  verify,
  register,
  clear
};