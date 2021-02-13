import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models/User";
import { Palette } from "../../src/models/Palette";
import { UserInitializer } from "../util/UserInitializer";
import { PaletteInitializer } from "../util/PaletteInitializer";
import _ from "lodash";

describe("Palette routes", () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await Palette.deleteMany({});
  });

  let user: UserInitializer;
  let jwt: any;
  let paletteInitializer: PaletteInitializer;
  beforeEach(async () => {
    user = new UserInitializer();
    await User.create(user);

    const res = await request(app)
      .post("/login")
      .send(user.getLogin())
      .expect(200);

    jwt = res.body.jwt;

    paletteInitializer = new PaletteInitializer();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Palette.deleteMany({});
  });

  describe("POST /palettes (CREATE)", () => {
    test("should respond 401 if not logged in", () => {
      return request(app)
        .post("/palettes")
        .send({})
        .expect(401);
    });

    test("should respond 415 if not json", async () => {
      return postPalette("")
        .expect(415);
    });

    test("should respond with a 400 request if name doesn't exist", async() => {
      paletteInitializer.name = "";
      const res = await postPalette(paletteInitializer).expect(400);
    });

    test("should respond with 200 if valid palette and send back palette saved", async () => {
      const res = await postPalette(paletteInitializer).expect(200);

      const paletteDoc = await Palette.findOne({name: paletteInitializer.name});
      expect(paletteDoc.id).toBe(res.body.id);
    });

    test("should respond with 400 if color is invalid", async () => {
      paletteInitializer.colors[0].name = "";
      await postPalette(paletteInitializer).expect(400);
    });

    test("should resond with 400 if a shade is invalid", async () => {
      paletteInitializer.colors[0].shades[0] = "randomString";
      await postPalette(paletteInitializer).expect(400);
    });

  });

  describe("GET /palettes/:id (READ)", () => {
    test("should respond with 401 if unauthenticated", async () => {
      await request(app)
        .get("/palettes/0")
        .expect(401);
    });

    test("should respond with 400 if invalid mongoose id", async () => {
      const res = await getPalette("0")
        .expect(400);
    });

    test("should respond with 400 if palette not found", async() => {
      const res = await getPalette("0".repeat(24))
        .expect(400);

      expect(res.body.message).toMatch(/No palette found for id: /);
    });

    test("should respond with 200 and palette if found", async () => {
      const postRes = await postPalette(paletteInitializer)
        .expect(200);

      const res = await getPalette(postRes.body.id)
        .expect(200);
      
      expect(res.body.id).toBe(postRes.body.id);
      expect(_.isMatch(res.body, paletteInitializer)).toBe(true);
    });
  });

  describe("GET /palettes (READ ALL)", () => {
    test("should respond 401 if unauthenticated", async () => {
      await request(app)
        .get("/palettes")
        .expect(401);
    });

    test("should respond with 200 and empty array if none found", async () => {
      const res = await getPalettes()
        .expect(200);

      expect(res.body.length).toBe(0);
    });

    test("should respond with 200 and palettes if palettes exist", async () => {
      const paletteOne = (await postPalette(paletteInitializer).expect(200)).body;
      paletteInitializer.name="whatever";
      const paletteTwo = (await postPalette(paletteInitializer).expect(200)).body;

      const res = await getPalettes()
        .expect(200);

      expect(res.body.reduce((acc: boolean, cur: any) => acc || _.isEqual(cur, paletteOne), false)).toBe(true);
      expect(res.body.reduce((acc: boolean, cur: any) => acc || _.isEqual(cur, paletteTwo), false)).toBe(true);
    });
  });

  describe("PUT /palettes/:id (UPDATE)", () => {
    test("should respond 401 if not authenticated", () => {
      return request(app)
        .put("/palettes/0")
        .expect(401)
    });

    test("should respond 400 if invalid mongo id", () => {
      return putPalette('0', {})
        .expect(400)
    });
  })

  function putPalette(id: string, body: any) {
    return request(app)
      .put("/palettes")
      .set("Authorization", "Bearer " + jwt)
      .send(body);
  }

  function postPalette(body: any) {
    return request(app)
      .post("/palettes")
      .set("Authorization", "Bearer " + jwt)
      .send(body);
  }

  function getPalette(id: string) {
    return request(app)
      .get("/palettes/" + id)
      .set("Authorization", "Bearer " + jwt);
  }

  function getPalettes() {
    return request(app)
      .get("/palettes")
      .set("Authorization", "Bearer " + jwt);
  }
});
