import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/models/User";
import { Palette } from "../../src/models/Palette";
import { UserInitializer } from "../util/UserInitializer";
import { PaletteInitializer } from "../util/PaletteInitializer";

describe("Palette routes", () => {
  let user: UserInitializer;
  let jwt: any;
  let palette: PaletteInitializer;
  beforeEach(async () => {
    user = new UserInitializer();
    await User.create(user);

    const res = await request(app)
      .post('/login')
      .send(user.getLogin())
      .expect(200)

    jwt = res.body.jwt;

    palette = new PaletteInitializer();
  });

  beforeAll(async () => {
    await User.deleteMany({});
    await Palette.deleteMany({});
  })

  afterEach(async () => {
    await User.deleteMany({});
    await Palette.deleteMany({});
  })

  describe("POST /palettes (CREATE)", () => {
    function paletteRequest(body: any) {
      return request(app)
        .post("/palettes")
        .set("Authorization", "Bearer " + jwt)
        .send(body);
    }
    test("should respond 401 if not logged in", () => {
      return request(app)
        .post('/palettes')
        .send({})
        .expect(401);
    });

    test("should respond 415 if not json", async () => {
      return paletteRequest("")
        .expect(415);
    })

    test("should respond with a 400 request if name doesn't exist", async() => {
      palette.name = "";
      const res = await paletteRequest(palette).expect(400);
    });

    test("should respond with 200 if valid palette and send back palette saved", async () => {
      const res = await paletteRequest(palette).expect(200);

      const paletteDoc = await Palette.findOne({name: palette.name});
      expect(paletteDoc.id).toBe(res.body._id);
    })

    test("should respond with 400 if color is invalid", async () => {
      palette.colors[0].name = ""
      await paletteRequest(palette).expect(400);
    });

    test("should resond with 400 if a shade is invalid", async () => {
      palette.colors[0].shades[0] = "randomString"
      await paletteRequest(palette).expect(400);
    })
  })
})