import refreshTokenRegistry from "../../src/util/refreshTokenRegistry";
import ms from "ms";
import redis from "redis";

const client = redis.createClient();

describe("refreshTokenRegistry", () => {
  beforeEach(async () => {
    await refreshTokenRegistry.remove("randomId");
  });
  test("can register a user", async () => {
    await refreshTokenRegistry.register("randomId");
    expect(refreshTokenRegistry.verify("randomId")).resolves.toBe(true);
  });

  test("verifies that a user is not valid", () => {
    return expect(refreshTokenRegistry.verify("randomId")).resolves.toBe(false);
  });

  test("each registration has 30d expiry", async (done) => {
    await refreshTokenRegistry.register("randomId");

    const ttl = client.ttl("randomId", (err, value) => {
      if (err) done(err); 

      expect(value).toBeGreaterThan(ms("29d")/1000);
      expect(value).toBeLessThan(ms("31d")/1000);
      done();
    });
  });
});