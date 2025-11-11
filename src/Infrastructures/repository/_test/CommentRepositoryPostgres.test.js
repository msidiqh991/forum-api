const CommentTableTestHelper = require("../../../../tests/CommentTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Indonesia",
    });

    await ThreadTableTestHelper.addThread({
      id: "thread-123",
      title: "Thread Title",
      body: "Thread Body",
      owner: "user-123",
      date: new Date().toISOString(),
    });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("Verify comment availability", () => {
    it("should throw NotFoundError when comment not available", async () => {
      // Arrange
      await CommentTableTestHelper.addComment({ id: "comment-123" });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability("comment-456")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw NotFoundError when comment available", async () => {
      // Arrange
      await CommentTableTestHelper.addComment({ id: "comment-123" });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability("comment-123")
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("Add comment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "This is a comment",
        threadId: "thread-123",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment
      );

      // Assert
      const comments = await CommentTableTestHelper.findCommentById(
        "comment-123"
      );

      expect(comments).toHaveLength(1);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "This is a comment",
          owner: "user-123",
          threadId: "thread-123",
        })
      );
    });
  });

  describe("Delete comment function", () => {
    it("should delete comment correctly", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "This is a comment",
        threadId: "thread-123",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const commentBeforeDelete = await CommentTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(commentBeforeDelete).toHaveLength(1);
      expect(commentBeforeDelete[0].is_deleted).toBe(false);

      // Action
      await commentRepositoryPostgres.deleteComment("comment-123");

      const commentAfterDelete = await CommentTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(commentAfterDelete).toHaveLength(1);
      expect(commentAfterDelete[0].is_deleted).toBe(true);
    });
  });

  describe("Verify comment owner", () => {
    it("should throw NotFoundError when comment not available", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-123")
      ).rejects.toThrowError(NotFoundError);

    })

    it("should throw AuthorizationError when comment owner is different with user", async () => {
      // Arrange
      await CommentTableTestHelper.addComment({ id: "comment-123", owner: "user-123" });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {})

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-456")
      ).rejects.toThrowError(AuthorizationError);
    })
  })
  
  describe("Error handling", () => {
    it("should throw NotFoundError when deleting non-existing comment", async () => {
      // Arrange
      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool, 
        fakeIdGenerator,
      )

      const invalidComment = { content: "invalid comment", owner: "user-123" };

      // Action & Assert
      await expect(
        commentRepositoryPostgres.deleteComment(invalidComment.id)
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw NotFoundError when add comment failed", async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        await expect(commentRepositoryPostgres.deleteComment('comment-123')).rejects.toThrowError(NotFoundError);
    });
  });
});
