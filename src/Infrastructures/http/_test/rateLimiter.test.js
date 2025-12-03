const RateLimiter = require("../rateLimiter");

describe("RateLimiter Middleware", () => {
  let rateLimiter;
  let request;
  let h;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 60000,
      limit: 5,
      minInterval: 1000,
    });

    h = {
      continue: Symbol("continue"),
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      takeover: jest.fn().mockReturnThis(),
    };

    request = {
      info: { remoteAddress: "127.0.0.1" },
      path: "/threads",
    };
  });

  test("should bypass limiter when ", async () => {
    rateLimiter.enabled = false;
    const response = rateLimiter.middleware()(request, h);
    expect(response).toBe(h.continue);
  });

  test("should allow requests when under limit", async () => {
    const result = rateLimiter.middleware()(request, h);
    expect(result).toBe(h.continue);
  });

  test("should allow request when interval is acceptable", () => {
    rateLimiter.enabled = true;
    rateLimiter.minInterval = 1000;

    const middleware = rateLimiter.middleware();

    middleware(request, h);

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 1500);

    const result = middleware(request, h);
    expect(result).toBe(h.continue);

    Date.now.mockRestore();
  });

  test("should bypass if path is not /threads", () => {
    const middleware = rateLimiter.middleware();
    request.path = "/users";

    const result = middleware(request, h);
    expect(result).toBe(h.continue);
  });

  test("should block requests exceeding limit", async () => {
    rateLimiter.enabled = true;
    rateLimiter.limit = 2;
    rateLimiter.windowMs = 60000;

    const middleware = rateLimiter.middleware();

    middleware(request, h);
    middleware(request, h);

    const response = middleware(request, h);
    expect(response).toBe(h.takeover());
    expect(h.code).toHaveBeenCalledWith(429);
    expect(h.takeover).toHaveBeenCalled();
  });

  test("should block when interval between requests is too fast", async () => {
    rateLimiter.enabled = true;
    rateLimiter.minInterval = 1000;

    const middleware = rateLimiter.middleware();
    middleware(request, h);

    const response = middleware(request, h);
    expect(response).toBe(h.takeover());
    expect(h.code).toHaveBeenCalledWith(429);
    expect(h.takeover).toHaveBeenCalled();
  });

  test("cleanup should remove expired timestamps", () => {
    const now = Date.now();

    rateLimiter.requests.set("127.0.0.1", [now - 70000, now - 10000]);

    rateLimiter.cleanup();
    const arr = rateLimiter.requests.get("127.0.0.1");
    expect(arr.length).toBe(1);
  });
});
