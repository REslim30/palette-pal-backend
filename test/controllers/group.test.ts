import app from "../../src/app";
import request from "supertest";
import { User } from "../../src/models/User";
import { Palette } from "../../src/models/Palette";
import { UserInitializer } from "../util/UserInitializer";
import GroupInitializer from "../util/GroupInitializer";
import Group from "../../src/models/Group";
import _ from "lodash";

beforeAll(async () => {
  await User.deleteMany({});
  await Palette.deleteMany({});
});

describe("group routes", () => {

  let user: UserDocument;
  let jwt: any;
  let groupInitializer: GroupInitializer;
  beforeEach(async () => {
    await User.deleteMany({});
    const userInitializer = new UserInitializer(); 
    user = await new User(userInitializer).save();

    const res = await request(app)
      .post("/login")
      .send(userInitializer.getLogin())
      .expect(200);

    jwt = res.body.jwt;

    groupInitializer = new GroupInitializer({ user: "randomid" });
  });

  describe("POST /groups", () => {
    test("should respond 401 if unauthenticated", () => {
      return request(app)
        .post('/groups')
        .send({})
        .expect(401);
    });

    test("should respond with 400 if invalid group object", () => {
      groupInitializer.name = undefined;
      return postGroup(groupInitializer)
        .expect(400);
    });

    test("should respond with a 415 if not JSON body", () => {
      return postGroup("hello")
        .expect(415)
    })

    test("should respond with a 200, and the new group created, if valid group object", async () => {
      const res = await postGroup(groupInitializer)
        .expect(200);
      
      const group = await Group.findById(res.body.id);
      expect(group.id).toBe(res.body.id)
    });

    test("should attach user to group", async () => {
      const res = await postGroup(groupInitializer)
        .expect(200);

      const group = await Group.findById(res.body.id);
      expect(group.user.toString()).toBe(user.id);
    });
  });

  describe("GET /palette/:id (READ)", () => {
    test("should return 401 if unauthenticated", () => {
      return request(app)
        .get('/palettes/0')
        .expect(401)
    });

    test("should return 400 if invalid mongo id", () => {
      return getGroup('0')
        .expect(400)
    });

    test("should return 400 if group not found", async () => {
      const res = await getGroup('0'.repeat(24))
        .expect(400)

      expect(res.body.message).toMatch("No group found for id: ")
    })

    test("should return 200 and the group if found", async() => {
      const postRes = await postGroup(groupInitializer);

      const res = await getGroup(postRes.body.id)
        .expect(200)

      expect(_.isEqual(postRes.body, res.body)).toBe(true);
    });

    test("should not return a group that belongs to another user", async () => {
      const otherGroup = await otherUserGroup();

      const res = await getGroup(otherGroup.id)
        .expect(400)
      
      expect(res.body.message).toMatch("No group found for id: ")
    });
  })

  function postGroup(body: any) {
    return request(app)
      .post('/groups')
      .send(body)
      .set("Authorization", "Bearer " + jwt);
  }

  function getGroup(id: string) {
    return request(app)
      .get('/groups/' + id)
      .set("Authorization", "Bearer " + jwt);
  }

  async function otherUserGroup() {
    const userInit = new UserInitializer({ username: "differentUser", email: "differentUser@gmail.com" })
    const user = await new User(userInit);
    return Group.create(new GroupInitializer({user: user.id}));
  }
});