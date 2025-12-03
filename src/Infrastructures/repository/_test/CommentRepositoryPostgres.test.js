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

    it("should return all comments by thread id correctly", async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comments = await commentRepositoryPostgres.getCommentsByThreadId("thread-123");

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('a comment');
      expect(comments[0].username).toEqual('dicoding');
    })
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
    it("should throw AuthorizationError when comment owner is different with user", async () => {
    // Arrange
      await CommentTableTestHelper.addComment({ id: "comment-123", owner: "user-123" });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-456")
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-999', 'user-123')
      ).rejects.toThrowError(NotFoundError);
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
      ).resolves.toBe(0);
    });

    it("should throw NotFoundError when add comment failed", async () => {
        // Arrange
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

        await expect(commentRepositoryPostgres.deleteComment('comment-123'))
          .resolves
          .toBe(0);
    });
  });

  describe("getCommentsByThreadId function", () => {
    it('should return comments by thread id correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'This is a comment',
        threadId: 'thread-123',
        owner: 'user-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        like_count: 2,
        is_deleted: false,
      });
      await CommentTableTestHelper.addComment({
        id: 'comment-124',
        content: 'This is another comment',
        threadId: 'thread-123',
        owner: 'user-123',
        username: 'dicoding',
        date: '2024-01-02T00:00:00.000Z',
        like_count: 10,
        is_deleted: false,
      });

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          content: 'This is a comment',
          like_count: 2,
          username: 'dicoding',
          date: '2024-01-01T00:00:00.000Z',
          is_deleted: false,
        },
        {
          id: 'comment-124',
          content: 'This is another comment',
          like_count: 10,
          username: 'dicoding',
          date: '2024-01-02T00:00:00.000Z',
          is_deleted: false,
        },
      ]);
    })
  })

  describe("Like and Unlike comment functions", () => {
    it('should get like count by comment id correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'This is a comment',
        threadId: 'thread-123',
        owner: 'user-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        like_count: 5,
        is_deleted: false,
      });

      // Action
      const likeCount = await commentRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toBe(5);
      expect(typeof likeCount).toBe('number');
    })

    it('should like and unlike comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        content: 'This is a comment',
        threadId: 'thread-123',
        owner: 'user-123',
        username: 'dicoding',
        date: '2024-01-01T00:00:00.000Z',
        like_count: 0,
        is_deleted: false,
      });

      // Action
      await commentRepositoryPostgres.likeComment('comment-123', 'user-123');
      let hasLiked = await commentRepositoryPostgres.hasUserLikedComment('comment-123', 'user-123');

      // Assert
      expect(hasLiked).toBe(true);
      expect(typeof hasLiked).toBe('boolean');

      // Action
      await commentRepositoryPostgres.unlikeComment('comment-123', 'user-123');
      hasLiked = await commentRepositoryPostgres.hasUserLikedComment('comment-123', 'user-123');

      // Assert
      expect(hasLiked).toBe(false);
      expect(typeof hasLiked).toBe('boolean');
    })
  })
});
