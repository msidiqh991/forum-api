class ToggleLikeCommentUseCase {
    constructor({ commentRepository, threadRepository }) {
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute({ threadId, commentId, owner }) {
        await this._threadRepository.verifyThreadAvailability(threadId);
        await this._commentRepository.verifyCommentAvailability(commentId);

        const isLiked =  await this._commentRepository.hasUserLikedComment(commentId, owner);

        if (isLiked) {
            await this._commentRepository.unlikeComment(commentId, owner);
        } else {
            await this._commentRepository.likeComment(commentId, owner);
        }
    }
}

module.exports = ToggleLikeCommentUseCase;