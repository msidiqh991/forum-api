/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentTableTestHelper = {
  async addComment({
    id = "comment-123",
    content = "This is a comment",
    threadId = "thread-123",
    owner = "user-123",
    date = new Date().toISOString(),
    is_deleted = false,
  }) {
    const query = {
      text: "INSERT INTO comments (id, content, owner, thread_id, date, is_deleted) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, owner, threadId, date, is_deleted],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("TRUNCATE TABLE comments CASCADE");
  },
};

module.exports = CommentTableTestHelper;
