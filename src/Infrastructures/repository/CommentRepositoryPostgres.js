const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
    }

    async verifyCommentAvailability(commentId) {
        const query = {
            text: 'SELECT id FROM comments WHERE id = $1',
            values: [commentId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('comment tidak ditemukan');
        }
    }

    async verifyCommentOwner(commentId, owner) {
        const query = {
            text: 'SELECT owner FROM comments WHERE id = $1',
            values: [commentId],
        }; 
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('comment tidak ditemukan');
        }

        const comment = result.rows[0];

        if (comment.owner !== owner) {
            throw new AuthorizationError('anda tidak berhak menghapus komentar ini');
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
            text: 'UPDATE comments SET is_deleted = true WHERE id = $1',
            values: [commentId],
        }

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('comment tidak ditemukan');
        }
    }
}

module.exports = CommentRepositoryPostgres;