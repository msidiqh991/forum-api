class DeleteReplyUseCase {
    constructor({ replyRepository }) {
        this._replyRepository = replyRepository;
    }

    async execute(useCasePayload) {
        this._validatePayload(useCasePayload);
        const { replyId } = useCasePayload;
        await this._replyRepository.verifyReplyAvailability(replyId);
        await this._replyRepository.verifyReplyOwner(replyId, useCasePayload.owner);
        await this._replyRepository.deleteReply(replyId);
    }

    _validatePayload(payload) {
        const { replyId } = payload
        if (!replyId) {
            throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_REPLY_ID');
        }

        if (typeof replyId !== 'string') {
            throw new Error('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = DeleteReplyUseCase;