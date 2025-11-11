const Jwt = require("@hapi/jwt");
const JwtTokenManager = require("../../security/JwtTokenManager");
const createServer = require("../createServer");

describe("HTTP server", () => {
  it("should response 404 when request unregistered route", async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: "GET",
      url: "/unregisteredRoute",
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it("should handle server error correctly", async () => {
    // Arrange
    const requestPayload = {
      username: "dicoding",
      fullname: "Dicoding Indonesia",
      password: "super_secret",
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual("error");
    expect(responseJson.message).toEqual("terjadi kegagalan pada server kami");
  });

  it("should call jwt validate function when accessing protected route", async () => {
    const fakeContainer = { getInstance: () => ({}) };
    const server = await createServer({ container: fakeContainer });

    server.route({
      method: "GET",
      path: "/protected",
      options: {
        auth: "forumapi_jwt",
        handler: (_, h) => {
          return h.response({ status: "success" }).code(200);
        },
      },
    });

    const jwtTokenManager = new JwtTokenManager(Jwt.token);
    const accessToken = await jwtTokenManager.createAccessToken({ id: "user-123" });
    
    const response = await server.inject({
      method: "GET",
      url: "/protected",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.payload)).toEqual({ status: "success" });
  });
});
