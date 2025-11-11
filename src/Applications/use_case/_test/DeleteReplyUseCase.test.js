const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
    it('should throw error if use case payload not contain reply id', async () => {
        // Arrange
        const useCasePayload = {};
        const deleteReplyUseCase = new DeleteReplyUseCase({});

        // Action & Assert
        await expect(deleteReplyUseCase.execute(useCasePayload))
            .rejects
            .toThrowError('DELETE_REPLY_USE_CASE.NOT_CONTAIN_REPLY_ID');
    })

    it('should throw error if reply id not string', async () => {
        // Arrange
        const useCasePayload = {
            replyId: 123,
        };

        const deleteReplyUseCase = new DeleteReplyUseCase({});

        // Action & Assert
        await expect(deleteReplyUseCase.execute(useCasePayload))
            .rejects
            .toThrowError('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    })

    it('should orchestrating the delete reply action correctly', async () => {
        // Arrange
        const useCasePayload = {
            replyId: 'reply-123',
        };

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.verifyReplyAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.verifyReplyOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.deleteReply = jest.fn()
            .mockImplementation(() => Promise.resolve());
            
        const deleteReplyUseCase = new DeleteReplyUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });

        // Act
        await deleteReplyUseCase.execute(useCasePayload);
        
        // Assert
        expect(mockReplyRepository.verifyReplyAvailability)
            .toHaveBeenCalledWith(useCasePayload.replyId);
        expect(mockReplyRepository.verifyReplyOwner)
            .toHaveBeenCalledWith(useCasePayload.replyId, useCasePayload.owner);
        expect(mockReplyRepository.deleteReply)
            .toHaveBeenCalledWith(useCasePayload.replyId);
    });
})