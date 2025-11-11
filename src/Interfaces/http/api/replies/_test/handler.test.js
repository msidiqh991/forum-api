const Jwt = require("@hapi/jwt");
const pool = require("../../../../../../src/Infrastructures/database/postgres/pool");
const UsersTableTestHelper = require("../../../../../../tests/UsersTableTestHelper");
const ThreadTableTestHelper = require("../../../../../../tests/ThreadTableTestHelper");
const CommentTableTestHelper = require("../../../../../../tests/CommentTableTestHelper");
const ReplyTableTestHelper = require("../../../../../../tests/ReplyTableTestHelper");
const createServer = require("../../../../../Infrastructures/http/createServer");
const container = require("../../../../../Infrastructures/container");
const JwtTokenManager = require("../../../../../Infrastructures/security/JwtTokenManager");

describe("Replies Handler", () => {
  let accessToken;

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });

    const jwtTokenManager = new JwtTokenManager(Jwt.token);
    accessToken = await jwtTokenManager.createAccessToken({ id: "user-123" });
  });

  beforeEach(async () => {
    await ThreadTableTestHelper.addThread({
      id: "thread-123",
      title: "Sample Thread",
      body: "This is a sample thread body.",
      owner: "user-123",
    });

    await CommentTableTestHelper.addComment({
      id: "comment-123",
      content: "Sample Comment",
      threadId: "thread-123",
      owner: "user-123",
    });
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await ReplyTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  it("should response 404 when thread not found", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-xxx/comments/comment-123/replies",
      payload: {
        content: "reply content",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual("fail");
  });

  it("should response 404 when comment not found", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-123/comments/comment-xxx/replies",
      payload: {
        content: "reply content",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert;
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual("fail");
  });

  it("should response 400 when request payload not contain needed property", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-123/comments/comment-123/replies",
      payload: {},
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(responseJson.status).toEqual("fail");
  });

  it("should response 201 and persisted reply", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-123/comments/comment-123/replies",
      payload: {
        content: "reply content",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJson.status).toEqual("success");
    expect(responseJson.data.addedReply).toBeDefined();
  });

  it("should response 200 when delete reply successfully", async () => {
    const server = await createServer(container);

    await ReplyTableTestHelper.addReply({
      id: "reply-123",
      content: "Sample Reply",
      commentId: "comment-123",
      owner: "user-123",
    });

    const response = await server.inject({
      method: "DELETE",
      url: "/threads/thread-123/comments/comment-123/replies/reply-123",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual("success");
  });
});
