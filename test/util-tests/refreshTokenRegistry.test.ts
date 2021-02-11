import refreshTokenRegistry from "../../src/util/refreshTokenRegistry";

describe("refreshTokenRegistry", () => {
  test("can register a user", () => {
    refreshTokenRegistry.register("randomId");
    expect(refreshTokenRegistry.verify("randomId")).toBe(true);
  });
})