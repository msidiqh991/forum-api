class AddedComment {
    constructor(payload) {
        this._verifyPayload(payload);
        const { id, content } = payload;

        this.id = id;
        this.content = content;
    }

    _verifyPayload({ id, content }) {
        if (!id || !content) {
            throw new Error('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof content !== 'string') {
            throw new Error('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = AddedComment;