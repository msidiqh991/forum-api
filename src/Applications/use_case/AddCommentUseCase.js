const NewComment = require('../../Domains/comments/entities/NewComment');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, owner, threadId) {
        await this._threadRepository.verifyThreadAvailability(threadId);
        const newComment = new NewComment({
            content: useCasePayload.content,
            owner,
            threadId,
        }); 

        const addedComment = await this._commentRepository.addComment(newComment);
        return new AddedComment({
            id: addedComment.id,
            content: addedComment.content,
            owner: addedComment.owner,
        });
    }
}

module.exports = AddCommentUseCase;