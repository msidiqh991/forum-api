class NewReply {
    constructor(payload) {
        this._verifyPayload(payload);
        const { content } = payload;
        this.content = content;
    }

    _verifyPayload({ content }) {
        if (!content || content.length === 0) {
            throw new Error('NEW_REPLY.NOT_CONTAIN_VALID_CONTENT');
        }

        if (typeof content !== 'string') {
            throw new Error('NEW_REPLY.NOT_CONTAIN_VALID_CONTENT');
        }
    }
}

module.exports = NewReply;