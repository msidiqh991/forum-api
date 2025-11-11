const NewReply = require('../NewReply');

describe('NewReply entities', () => {
    it('should throw error when payload not contain valid content', () => {
        const payload = { content: '' };
        expect(() => new NewReply(payload))
            .toThrowError('NEW_REPLY.NOT_CONTAIN_VALID_CONTENT');
    })

    it('should throw error when payload not meet data type specification', () => {
        const payload = { 
            content: 12345,
            owner: {},
            commentId: [],
        };
        
        expect(() => new NewReply(payload))
            .toThrowError('NEW_REPLY.NOT_CONTAIN_VALID_CONTENT');
    })

    it('should create NewReply object correctly', () => {
        const payload = { 
            content: 'Example content of a new reply',
            owner: 'user-123',
            commentId: 'comment-123',
        };
        const newReply = new NewReply(payload);

        expect(newReply).toBeInstanceOf(NewReply);
        expect(newReply.content).toEqual(payload.content);
        expect(newReply.owner).toEqual(payload.owner);
        expect(newReply.commentId).toEqual(payload.commentId);
    })

    it('should throw error when content is only spaces', () => {
        const payload = { 
            content: '     ',
            owner: 'user-123',
            commentId: 'comment-123',
        };
        
        expect(() => new NewReply(payload))
            .toThrowError('NEW_REPLY.NOT_CONTAIN_VALID_CONTENT');
    })
})