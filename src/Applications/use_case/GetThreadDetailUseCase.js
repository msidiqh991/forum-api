const GetDetailThread = require("../../Domains/threads/entities/GetDetailThread");

class GetThreadDetailUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(threadId) {
        await this._threadRepository.verifyThreadAvailability(threadId);

        const thread = await this._threadRepository.getThreadById(threadId);
        const comments =  await this._commentRepository.getCommentsByThreadId(threadId);
        const replies = await this._replyRepository.getRepliesByThreadId(threadId);

        const mappedComments = comments.map(comment => ({
            id: comment.id,
            username: comment.username,
            date: comment.date,
            content: comment.is_deleted ? "**komentar telah dihapus**" : comment.content,
            likeCount: comment.like_count,
            replies: replies
                .filter(reply => reply.comment_id === comment.id)
                .map(reply => ({
                    id: reply.id,
                    username: reply.username,
                    date: reply.date,
                    content: reply.is_deleted ? "**balasan telah dihapus**" : reply.content,
                })),
        }))

        return new GetDetailThread({
            id: thread.id,
            title: thread.title,
            body: thread.body,
            date: thread.date,
            username: thread.username,
            comments: mappedComments,
        });
    }
}

module.exports = GetThreadDetailUseCase;