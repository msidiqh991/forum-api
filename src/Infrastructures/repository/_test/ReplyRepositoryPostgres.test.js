const ReplyTableTestHelper = require("../../../../tests/ReplyTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const CommentTableTestHelper = require("../../../../tests/CommentTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("ReplyRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });

    await ThreadTableTestHelper.addThread({
      id: "thread-123",
      title: "A Thread",
      body: "This is a thread",
      owner: "user-123",
    });

    await CommentTableTestHelper.addComment({
      id: "comment-123",
      content: "This is a comment",
      threadId: "thread-123",
      owner: "user-123",
      date: new Date().toISOString(),
    });
  });

  afterEach(async () => {
    await ReplyTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyReplyAvailability function", () => {
    it("should throw NotFoundError when reply not available", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await ReplyTableTestHelper.addReply({ id: "reply-123" });

      await expect(
        replyRepository.verifyReplyAvailability("reply-456")
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw NotFoundError when reply available", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await ReplyTableTestHelper.addReply({ id: "reply-123" });

      await expect(
        replyRepository.verifyReplyAvailability("reply-123")
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe("addReply function", () => {
    it("should persist new reply and return added reply correctly", async () => {
      // Arrange
      const newReply = new NewReply({
        content: "This is a reply",
        owner: "user-123",
        commentId: "comment-123",
      });

      const fakeIdGenerator = () => "123";
      const replyRepository = new ReplyRepositoryPostgres(pool, {
        newId: fakeIdGenerator,
      });

      // Action
      const addedReply = await replyRepository.addReply(newReply);

      // Assert
      const replies = await ReplyTableTestHelper.findReplyById("reply-123");

      expect(replies).toHaveLength(1);
      expect(addedReply).toMatchObject(
        new AddedReply({
          id: "reply-123",
          content: "This is a reply",
          owner: "user-123",
        })
      );
    });
  });

  describe("deleteReply function", () => {
    it("should mark reply as deleted", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await ReplyTableTestHelper.addReply({ id: "reply-123" });

      // Action
      await replyRepository.deleteReply("reply-123");

      // Assert
      const reply = await ReplyTableTestHelper.findReplyById("reply-123");
      expect(reply[0].is_deleted).toBe(true);

      expect(reply).toHaveLength(1);
      expect(reply[0]).toMatchObject({
        id: "reply-123",
        content: "This is a reply",
        owner: "user-123",
        is_deleted: true,
      });
    });

    it("should throw NotFoundError when reply to delete not found", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await ReplyTableTestHelper.addReply({ id: "reply-123" });

      // Action & Assert
      await expect(
        replyRepository.deleteReply("reply-456")
      ).rejects.toThrowError(NotFoundError);
    });

    it("Should response 403 when user delete reply they do not own", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await ReplyTableTestHelper.addReply({
        id: "reply-123",
        owner: "user-123",
      });

      // Action & Assert
      await expect(
        replyRepository.verifyReplyOwner("reply-123", "user-456")
      ).rejects.toThrowError(AuthorizationError);
    });
  });

  describe("GetRepliesByThreadId function", () => {
    it("should get replies by thread id correctly", async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});
      await ReplyTableTestHelper.addReply({
        id: "reply-123",
        content: "This is a reply",
        owner: "user-123",
        username: "dicoding",
        comment_id: "comment-123",
        date: "2024-01-01T00:00:00.000Z",
      });

      // Action
      const replies = await replyRepository.getRepliesByThreadId("thread-123");

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies).toStrictEqual([
        {
          id: "reply-123",
          content: "This is a reply",
          owner: "user-123",
          username: "dicoding",
          comment_id: "comment-123",
          date: "2024-01-01T00:00:00.000Z",
          is_deleted: false,
        },
      ]);
    });
  })
});
