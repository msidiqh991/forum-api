const Jwt = require("@hapi/jwt");
const pool = require("../../../../../../src/Infrastructures/database/postgres/pool");
const UsersTableTestHelper = require("../../../../../../tests/UsersTableTestHelper");
const ThreadTableTestHelper = require("../../../../../../tests/ThreadTableTestHelper");
const CommentTableTestHelper = require("../../../../../../tests/CommentTableTestHelper");
const createServer = require("../../../../../Infrastructures/http/createServer");
const container = require("../../../../../Infrastructures/container");
const JwtTokenManager = require("../../../../../Infrastructures/security/JwtTokenManager");

describe("Comments Handler", () => {
  let accessToken;

  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });

    await UsersTableTestHelper.addUser({
      id: "user-456",
      username: "johndoe",
      password: "secret",
      fullname: "John Doe",
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
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  it("should response 404 when thread not found", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-xxx/comments",
      payload: {
        content: "comment content",
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

  it("should response 400 when request payload not contain needed property", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-123/comments",
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

  it("should response 201 and persisted comments", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "POST",
      url: "/threads/thread-123/comments",
      payload: {
        content: "comment content",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJson.status).toEqual("success");
    expect(responseJson.data.addedComment).toBeDefined();
  });

  it("should response 200 when delete comment successfully", async () => {
    const server = await createServer(container);

    await CommentTableTestHelper.addComment({
      id: "comment-123",
      content: "comment content",
      threadId: "thread-123",
      owner: "user-123",
    });

    const response = await server.inject({
      method: "DELETE",
      url: "/threads/thread-123/comments/comment-123",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual("success");
  });

  it("should response 404 when like with invalid thread id", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "PUT",
      url: "/threads/thread-xxx/comments/comment-123/likes",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual("fail");
  });

  it("should response 404 when like with invalid comment id", async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: "PUT",
      url: "/threads/thread-123/comments/comment-xxx/likes",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(404);
    expect(responseJson.status).toEqual("fail");
  });

  it("should response 200 when user likes another user's comment", async () => {
    const server = await createServer(container);

    await CommentTableTestHelper.addComment({
      id: "comment-123",
      content: "comment from johndoe",
      threadId: "thread-123",
      owner: "user-456",
    });

    const response = await server.inject({
      method: "PUT",
      url: "/threads/thread-123/comments/comment-123/likes",
      headers: {
        Authorization: `Bearer ${accessToken}`, 
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual("success");
  });

  it("should response 200 when user likes their own comment", async () => {
    const server = await createServer(container);

    await CommentTableTestHelper.addComment({
      id: "comment-123",
      content: "comment from dicoding",
      threadId: "thread-123",
      owner: "user-123",
    });

    const response = await server.inject({
      method: "PUT",
      url: "/threads/thread-123/comments/comment-123/likes",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual("success");
  });

  it("should response 200 when dicoding unlikes his own comment", async () => {
    const server = await createServer(container);

    await CommentTableTestHelper.addComment({
      id: "comment-123",
      content: "comment from dicoding",
      threadId: "thread-123",
      owner: "user-123",
    });

    await server.inject({
      method: "PUT",
      url: "/threads/thread-123/comments/comment-123/likes",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const response = await server.inject({
      method: "PUT",
      url: "/threads/thread-123/comments/comment-123/likes",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual("success");
  });
});