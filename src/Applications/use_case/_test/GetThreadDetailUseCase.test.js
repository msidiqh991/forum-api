const GetDetailThread = require("../../../Domains/threads/entities/GetDetailThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");

const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrating the get thread detail action correctly", async () => {
    const threadId = "thread-123";

    const mockThread = {
      id: threadId,
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
    };

    const mockComments = [
      {
        id: "comment-123",
        username: "dicoding",
        date: "2021-08-08T07:22:33.555Z",
        content: "sebuah komentar",
        is_deleted: false,
        like_count: 2,
      },
      {
        id: "comment-999",
        username: "userX",
        date: "2021-08-08T07:25:00.000Z",
        content: "komentar dihapus",
        is_deleted: true,
        like_count: 5,
      },
    ];

    const mockReplies = [
      {
        id: "reply-123",
        comment_id: "comment-123",
        username: "dicoding",
        date: "2021-08-08T07:30:00.000Z",
        content: "sebuah balasan",
        is_deleted: false,
      },
      {
        id: "reply-999",
        comment_id: "comment-999",
        username: "userX",
        date: "2021-08-08T07:35:00.000Z",
        content: "balasan dihapus",
        is_deleted: true,
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplies));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await getThreadDetailUseCase.execute(threadId);

    expect(result).toStrictEqual(
      new GetDetailThread({
        id: threadId,
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [
          {
            id: "comment-123",
            username: "dicoding",
            date: "2021-08-08T07:22:33.555Z",
            content: "sebuah komentar",
            likeCount: 2,
            replies: [
              {
                id: "reply-123",
                username: "dicoding",
                date: "2021-08-08T07:30:00.000Z",
                content: "sebuah balasan",
              },
            ],
          },
          {
            id: "comment-999",
            username: "userX",
            date: "2021-08-08T07:25:00.000Z",
            content: "**komentar telah dihapus**",
            likeCount: 5,
            replies: [
              {
                id: "reply-999",
                username: "userX",
                date: "2021-08-08T07:35:00.000Z",
                content: "**balasan telah dihapus**",
              },
            ],
          },
        ],
      })
    );

    expect(mockThreadRepository.verifyThreadAvailability)
      .toHaveBeenCalledWith(threadId);
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(threadId);
    expect(mockReplyRepository.getRepliesByThreadId)
      .toHaveBeenCalledWith(threadId);
  });

  it("should throw error when thread not available", async () => {
    const threadId = "thread-123";

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("THREAD_NOT_FOUND")));

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await expect(getThreadDetailUseCase.execute(threadId))
        .rejects
        .toThrowError("THREAD_NOT_FOUND");

    expect(mockThreadRepository.verifyThreadAvailability)
        .toHaveBeenCalledWith(threadId);
  });
});
