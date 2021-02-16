import app from "../../src/app";
import request from "supertest";
import { User } from "../../src/models/User";
import { Palette } from "../../src/models/Palette";
import { UserInitializer } from "../util/UserInitializer";
import GroupInitializer from "../util/GroupInitializer";
import Group from "../../src/models/Group";
import _ from "lodash";
import { PaletteInitializer } from "../util/PaletteInitializer";

beforeAll(async () => {
  await User.deleteMany({});
  await Palette.deleteMany({});
  await Group.deleteMany({});
});

describe("group routes", () => {

  let user: UserDocument;
  let jwt: any;
  let groupInitializer: GroupInitializer;
  let palette1: PaletteDocument;
  let palette2: PaletteDocument;
  beforeEach(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Palette.deleteMany({});
    const userInitializer = new UserInitializer(); 
    user = await new User(userInitializer).save();

    const res = await request(app)
      .post("/login")
      .send(userInitializer.getLogin())
      .expect(200);

    jwt = res.body.jwt;

    palette1 = new Palette(new PaletteInitializer({ name: "palette1", user: user.id }));
    palette2 = new Palette(new PaletteInitializer({ name: "palette2", user: user.id }));
    palette1 = await palette1.save();
    palette2 = await palette2.save();
    groupInitializer = new GroupInitializer({ user: "randomid", palettes: [palette1.id, palette2.id] });
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

  describe("GET /groups/:id (READ)", () => {
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

      expect(postRes.body).toStrictEqual(res.body);
    });

    test("should not return a group that belongs to another user", async () => {
      const otherGroup = await otherUserGroup();

      const res = await getGroup(otherGroup.id)
        .expect(400)
      
      expect(res.body.message).toMatch("No group found for id: ");
    });
  })

  describe("GET /groups (READALL)", () => {
    test("should respond 401 if unauthenticated", () => {
      return request(app)
        .get('/groups')
        .expect(401)
    });

    test("should respond 200 and an empty array if no groups fround", async () => {
      const res = await getGroup()
        .expect(200)
      
      expect(res.body).toStrictEqual([]);
    });

    test("should respond 200 and a list of groups if groups are found", async () => {
      const palette1Res = await postGroup(new GroupInitializer()).expect(200);
      const palette2Res = await postGroup(new GroupInitializer()).expect(200);

      const res = await getGroup()
        .expect(200)
      
      expect(res.body).toStrictEqual([palette1Res.body, palette2Res.body]);
    });

    test("should not respond with other users groups", async () => {
      await otherUserGroup();

      const res = await getGroup()
        .expect(200)

      expect(res.body).toStrictEqual([]);
    });
  });

  describe("PUT /groups/:id", () => {
    test("should respond with a 401 if not authenticated", () => {
      return request(app)
        .put('/palettes/0')
        .expect(401)
    });

    test("should respond with a 400 if invalid mongo id", () => {
      return putGroup('0')
        .expect(400)
    });

    test("should respond with a 400 if no group found", async () => {
      const res = await putGroup('0'.repeat(24))
        .expect(400)
      
      expect(res.body.message).toMatch("No group found for id: ");
    })

    test("should respond with 200 if found", async () => {
      const groupRes = await postGroup(groupInitializer).expect(200);

      const res = await putGroup(groupRes.body.id);
    });

    test("should update group", async () => {
      const groupRes = await postGroup(groupInitializer).expect(200);

      const res = await putGroup(groupRes.body.id, { name: "new updated name" }).expect(200);

      const group = await Group.findById(groupRes.body.id);

      expect(group.name).toBe("new updated name");
    });

    test("should not be able to update another users group", async () => {
      const otherGroup = await otherUserGroup();

      const res = await putGroup(otherGroup.id).expect(400)

      expect(res.body.message).toMatch("No group found for id: ")
    });
  })

  describe("DELETE /groups/:id (DELETE)", () => {
    test("should respond 401 if unauthenticated", () => {
      return request(app)
        .delete('/groups')
        .expect(401)
    });

    test("should respond 400 if invalid mongo id", () => {
      return deleteGroup('0')
        .expect(400);
    });

    test("should respond 400 if group not found", () => {
      return deleteGroup('0'.repeat(24))
        .expect(400)
    });

    test("should respond 200 and group if found", async () => {
      const postRes = await postGroup(groupInitializer).expect(200);

      const res = await deleteGroup(postRes.body.id).expect(200);
      
      expect(res.body).toStrictEqual(postRes.body)

      expect(Group.findById(res.body.id)).resolves.toBe(null);
    });

    test("should not be able to access another users group", async () => {
      const group = await otherUserGroup();

      const res = await deleteGroup(group.id).expect(400);
    });
  });

  function postGroup(body: any) {
    return request(app)
      .post('/groups')
      .send(body)
      .set("Authorization", "Bearer " + jwt);
  }

  function getGroup(id: string = '') {
    return request(app)
      .get('/groups/' + id)
      .set("Authorization", "Bearer " + jwt);
  }
  
  function putGroup(id: string, body: any = {}) {
    return request(app)
      .put('/groups/' + id)
      .send(body)
      .set("Authorization", "Bearer " + jwt);
  }

  function deleteGroup(id: string) {
    return request(app)
      .delete('/groups/' + id)
      .set("Authorization", "Bearer " + jwt);
  }

  async function otherUserGroup() {
    const userInit = new UserInitializer({ username: "differentUser", email: "differentUser@gmail.com" })
    const user = await new User(userInit);
    return Group.create(new GroupInitializer({user: user.id}));
  }
});