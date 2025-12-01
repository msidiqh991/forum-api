const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyCommentAvailability(commentId) {
    const query = {
      text: "SELECT id FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("comment tidak ditemukan");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];

    if (!comment) {
      throw new NotFoundError("comment tidak ditemukan");
    }

    if (comment.owner !== owner) {
      throw new AuthorizationError("anda tidak berhak menghapus komentar ini");
    }
  }

  async addComment(newComment) {
    const { content, threadId, owner } = newComment;

    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const is_deleted = false;

    const query = {
      text: `
        INSERT INTO comments (id, content, owner, thread_id, date, is_deleted) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, content, owner, thread_id AS "threadId"
      `,
      values: [id, content, owner, threadId, date, is_deleted],
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async deleteComment(commentId) {
    const query = {
      text: "UPDATE comments SET is_deleted = true WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rowCount;
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT c.id, c.content, c.date, c.is_deleted, c.like_count, u.username
           FROM comments c
           JOIN users u ON c.owner = u.id
           WHERE c.thread_id = $1
           ORDER BY c.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async hasUserLikedComment(commentId, userId) {
    const query = {
      text: `SELECT 1 FROM comments 
            WHERE id = $1 
            AND $2 = ANY (liked_by)`,
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async likeComment(commentId, userId) {
    const query = {
      text: `UPDATE comments 
            SET like_count = like_count + 1, 
            liked_by = array_append(liked_by, $2) 
            WHERE id = $1`,
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: `UPDATE comments 
            SET like_count = like_count - 1, 
            liked_by = array_remove(liked_by, $2) 
            WHERE id = $1`,
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: `SELECT like_count FROM comments WHERE id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].like_count;
  }
}

module.exports = CommentRepositoryPostgres;
