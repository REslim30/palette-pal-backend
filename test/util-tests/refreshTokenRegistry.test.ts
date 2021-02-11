import refreshTokenRegistry from "../../src/util/refreshTokenRegistry";
import MockDate from "mockdate";
import ms from "ms";

describe("refreshTokenRegistry", () => {
  beforeEach(() => {
    refreshTokenRegistry.clear();
  })

  afterEach(() => {
    MockDate.reset();
  })
  test("can register a user", () => {
    refreshTokenRegistry.register("randomId");
    expect(refreshTokenRegistry.verify("randomId")).toBe(true);
  });

  test("verifies that a user is not valid", () => {
    expect(refreshTokenRegistry.verify("randomId")).toBe(false);
  })

  test("each registration has 30d expiry", () => {
    refreshTokenRegistry.register("randomId");
    MockDate.set(new Date().getTime() + ms('30d') + 5)
    expect(refreshTokenRegistry.verify("randomId")).toBe(false);
  });
})