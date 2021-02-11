import ms from "ms";
type RefreshToken = {
  expires: Date;
};
const refreshTokenRegistry = new Map<string, RefreshToken>();
export function verify(userId: string): boolean {
  if (!refreshTokenRegistry.has(userId))
    return false;
  
  return true;
}

export function register(userId: string): void {
  refreshTokenRegistry.set(userId, { expires: getExpiry() });
}

function getExpiry(): Date {
  return new Date(new Date().getTime() + ms("30d"));
}

export default {
  verify,
  register
};