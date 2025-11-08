class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { commentId } = useCasePayload;
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._commentRepository.deleteComment(commentId);
  }

  _validatePayload(payload) {
    const { commentId } = payload;
    if (!commentId) {
      throw new Error("DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID");
    }

    if (typeof commentId !== "string") {
      throw new Error(
        "DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    }
  }
}

module.exports = DeleteCommentUseCase;