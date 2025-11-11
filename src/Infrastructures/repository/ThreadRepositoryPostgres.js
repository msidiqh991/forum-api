const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AddedThread = require("../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads VALUES ($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);
    return new AddedThread({ ...result.rows[0] });
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
  }

  async getThreadById(threadId) {
    const threadQuery = {
      text: `SELECT 
              t.id, t.title, t.body, t.date, u.username
             FROM threads t
             JOIN users u ON t.owner = u.id
             WHERE t.id = $1`,
      values: [threadId],
    }

    const commentQuery = {
      text: `SELECT 
              c.id, c.content, c.date, u.username,
            CASE WHEN c.is_deleted = true THEN true ELSE false END AS is_deleted
            FROM comments c
            INNER JOIN users u ON c.owner = u.id
            WHERE c.thread_id = $1
            ORDER BY c.date ASC`,
      values: [threadId],
    }

    const replyQuery = {
      text: `SELECT
              r.id, r.content, r.date, r.comment_id, r.is_deleted, u.username
            FROM replies r
            INNER JOIN users u on r.owner = u.id
            WHERE r.comment_id IN (SELECT id FROM comments WHERE thread_id = $1)
            ORDER BY r.date ASC`,
      values: [threadId],
    }

    const threadResult = await this._pool.query(threadQuery);

    if (!threadResult.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }
    
    const thread = threadResult.rows[0];
    const commentResult = await this._pool.query(commentQuery);
    const repliesResult = await this._pool.query(replyQuery);

    const comments = commentResult.rows.map((comment) => {
      const replies = repliesResult.rows
        .filter(reply => reply.comment_id === comment.id)
        .map(reply => ({
          id: reply.id,
          content: reply.is_deleted ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        }))

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
        replies,
      }
    });

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments,
    };
  }
}

module.exports = ThreadRepositoryPostgres;
