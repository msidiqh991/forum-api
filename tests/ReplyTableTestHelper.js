/* istanbul ignore file */

const pool = require("../src/Infrastructures/database/postgres/pool");

const ReplyTableTestHelper = {
  async addReply({
    id = "reply-123",
    content = "This is a reply",
    owner = "user-123",
    commentId = "comment-123",
    isDeleted = false,
    date = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, content, owner, commentId, isDeleted, date],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: `SELECT id, content, owner, is_deleted FROM replies WHERE id = $1`,
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("TRUNCATE TABLE replies CASCADE");
  },
};

module.exports = ReplyTableTestHelper;
