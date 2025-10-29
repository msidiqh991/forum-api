const GetDetailThread = require("../GetDetailThread");

describe("GetDetailThread Interface", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      title: "Thread Title",
      body: "Thread Body",
      date: "2024-01-01T00:00:00.000Z",
      username: "user-123",
      comments: [],
    };

    expect(() => new GetDetailThread(payload)).toThrowError(
      "GET_DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    const payload = {
      id: 123,
      title: "Thread Title",
      body: "Thread Body",
      date: "2024-01-01T00:00:00.000Z",
      username: "user-123",
      comments: [],
    };

    expect(() => new GetDetailThread(payload)).toThrowError(
      "GET_DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create GetDetailThread object correctly", () => {
    const payload = {
      id: "thread-123",
      title: "Thread Title",
      body: "Thread Body",
      date: "2024-01-01T00:00:00.000Z",
      username: "user-123",
      comments: [],
    };

    const getDetailThread = new GetDetailThread(payload);

    expect(getDetailThread.id).toEqual(payload.id);
    expect(getDetailThread.title).toEqual(payload.title);
    expect(getDetailThread.body).toEqual(payload.body);
    expect(getDetailThread.date).toEqual(payload.date);
    expect(getDetailThread.username).toEqual(payload.username);
    expect(getDetailThread.comments).toEqual(payload.comments);
  });
});
