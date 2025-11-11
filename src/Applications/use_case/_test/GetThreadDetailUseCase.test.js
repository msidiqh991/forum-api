const GetDetailThread = require("../../../Domains/threads/entities/GetDetailThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrating the get thread detail action correctly", async () => {
    const threadId = "thread-123";

    const mockThreadData = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
      comments: [],
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadData));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    const thread = await getThreadDetailUseCase.execute(threadId);

    expect(thread).toStrictEqual(
      new GetDetailThread({
        id: threadId,
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [],
      })
    );
    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);
  });

  it("should throw error when thread not available", async () => {
    const threadId = "thread-123";

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("THREAD_NOT_FOUND")));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
    });

    await expect(getThreadDetailUseCase.execute(threadId))
        .rejects
        .toThrowError("THREAD_NOT_FOUND");

    expect(mockThreadRepository.verifyThreadAvailability)
        .toHaveBeenCalledWith(threadId);
  });
});
