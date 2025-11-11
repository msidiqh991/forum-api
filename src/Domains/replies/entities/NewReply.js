class NewReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { content, owner, commentId } = payload;
    this.content = content;
    this.owner = owner;
    this.commentId = commentId;
  }

  _verifyPayload({ content, owner, commentId }) {
    if (!content || content.length === 0 || !owner || !commentId) {
      throw new Error("NEW_REPLY.NOT_CONTAIN_VALID_CONTENT");
    }

    if (
      typeof content !== "string" ||
      typeof owner !== "string" ||
      typeof commentId !== "string"
    ) {
      throw new Error("NEW_REPLY.NOT_CONTAIN_VALID_CONTENT");
    }

    if (content.trim().length === 0) {
      throw new Error("NEW_REPLY.NOT_CONTAIN_VALID_CONTENT");
    }
  }
}

module.exports = NewReply;
