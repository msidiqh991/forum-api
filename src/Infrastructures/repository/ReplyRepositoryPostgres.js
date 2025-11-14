const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async verifyReplyAvailability(replyId) {
        const query = {
            text: 'SELECT id FROM replies WHERE id = $1',
            values: [replyId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('reply tidak ditemukan');
        }
    }

    async verifyReplyOwner(replyId, owner) {
        const query = {
            text: 'SELECT owner FROM replies WHERE id = $1 AND owner = $2',
            values: [replyId, owner],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new AuthorizationError('anda tidak berhak menghapus reply ini');
        }
    }

    async addReply(newReply) {
        const { content, owner, commentId } = newReply;
        const id = `reply-${this._idGenerator.newId()}`;
        const date = new Date().toISOString();

        const query = {
            text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
            values: [id, content, owner, commentId, false, date],
        };

        const result = await this._pool.query(query);
        return new AddedReply({ ...result.rows[0] });
    }

    async deleteReply(replyId) {
        const query = {
            text: 'UPDATE replies SET is_deleted = true WHERE id = $1',
            values: [replyId],
        }

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('reply tidak ditemukan');
        }
    }

    async getRepliesByThreadId(threadId) {
        const query = {
            text: `SELECT 
                    r.id, 
                    r.content, 
                    r.date, 
                    r.is_deleted, 
                    r.comment_id, 
                    r.owner,
                    u.username
                   FROM replies r
                   JOIN users u ON r.owner = u.id
                   WHERE r.comment_id IN (SELECT id FROM comments WHERE thread_id = $1)
                   ORDER BY r.date ASC`,
            values: [threadId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = ReplyRepositoryPostgres;