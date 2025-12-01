const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ToggleLikeCommentUseCase = require("../ToggleLikeCommentUseCase");

describe("ToggleLikeCommentUseCase", () => {
  it("should orchestrating the toggle like comment action correctly", async () => {
    const payload = {
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123"
    }

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.hasUserLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockCommentRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
    });

    await toggleLikeCommentUseCase.execute(payload);

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(payload.commentId);
    expect(mockCommentRepository.hasUserLikedComment).toBeCalledWith(payload.commentId, payload.owner);
    expect(mockCommentRepository.likeComment).toBeCalledWith(payload.commentId, payload.owner);
  })

  it("should orchestrating the toggle unlike comment action correctly", async () => {
    const payload = {
        threadId: "thread-123",
        commentId: "comment-123",
        owner: "user-123"
    }

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.hasUserLikedComment = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockCommentRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.unlikeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
    });

    await toggleLikeCommentUseCase.execute(payload);

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(payload.threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(payload.commentId);
    expect(mockCommentRepository.hasUserLikedComment).toBeCalledWith(payload.commentId, payload.owner);
    expect(mockCommentRepository.unlikeComment).toBeCalledWith(payload.commentId, payload.owner);
  })
})