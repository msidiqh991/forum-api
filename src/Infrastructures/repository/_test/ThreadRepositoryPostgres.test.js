const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentTableTestHelper = require("../../../../tests/CommentTableTestHelper");
const ReplyTableTestHelper = require("../../../../tests/ReplyTableTestHelper");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });
  });

  afterEach(async () => {
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyThreadAvailability function", () => {
    it("should throw NotFoundError when thread not available", async () => {
      // Arrange
      await ThreadTableTestHelper.addThread({ id: "thread-123" });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyThreadAvailability("thread-456")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when thread available", async () => {
      // Arrange
      await ThreadTableTestHelper.addThread({ id: "thread-123" });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyThreadAvailability("thread-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("addThread function", () => {
    it("should persist new thread and return added thread correctly", async () => {
      // Arrange
      const newThread = new NewThread({
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadTableTestHelper.getThreadById("thread-123");

      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: "sebuah thread",
          owner: "user-123",
        })
      );
    });
  });

  describe("getThreadById function", () => {
    it("should return thread with comments and replies when thread is found", async () => {
      await ThreadTableTestHelper.addThread({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        owner: "user-123",
      });

      await CommentTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        content: "sebuah comment",
        owner: "user-123",
      });

      await ReplyTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        content: "sebuah balasan",
        owner: "user-123",
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => {}
      );
      const thread = await threadRepositoryPostgres.getThreadById("thread-123");

      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].replies).toHaveLength(1);
      expect(thread.comments[0].replies[0].content).toEqual("sebuah balasan");
    });

    it("should throw NotFoundError when thread not found", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => {}
      );
      const thread = await ThreadTableTestHelper.getThreadById("thread-999");

      expect(thread).toHaveLength(0);
      await expect(
        threadRepositoryPostgres.getThreadById("thread-999")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return deleted comment and reply content replace with placeholder", async () => {
      await ThreadTableTestHelper.addThread({
        id: "thread-999",
        title: "thread terhapus",
        body: "body thread terhapus",
        owner: "user-123",
      });

      await CommentTableTestHelper.addComment({
        id: "comment-999",
        threadId: "thread-999",
        content: "**komentar telah dihapus**",
        owner: "user-123",
        is_deleted: true,
      });

      await ReplyTableTestHelper.addReply({
        id: "reply-999",
        commentId: "comment-999",
        content: "**balasan telah dihapus**",
        owner: "user-123",
        is_deleted: true,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => {}
      );
      const thread = await threadRepositoryPostgres.getThreadById("thread-999");

      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].content).toEqual("**komentar telah dihapus**");
      expect(thread.comments[0].replies).toHaveLength(1);
      expect(thread.comments[0].replies[0].content).toEqual("**balasan telah dihapus**");
    });
  });
});
