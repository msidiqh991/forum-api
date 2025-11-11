const NewComment = require('../NewComment');

describe('NewComment entities', () => {
    it('should throw error when payload not contain needed property', () => {
        const payload = {};

        expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    })

    it('should throw error when payload not meet data type specification', () => {
        const payload = {
            content: 123,
            threadId: true,
            owner: 456,
        }

        expect(() => new NewComment(payload)).toThrowError('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    })

    it('should create NewComment object correctly', () => {
        const payload = {
            content: 'This is a comment',
            threadId: 'thread-123',
            owner: 'user-123',
        }

        const newComment = new NewComment(payload);
        expect(newComment.content).toEqual(payload.content);
        expect(newComment.threadId).toEqual(payload.threadId);
        expect(newComment.owner).toEqual(payload.owner);
    })
})