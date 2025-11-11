const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
    it('should throw 404 when comment not found', async () => {
        // Arrange
        const useCasePayload = { commentId: 'comment-123' };

        const mockCommentRepository = new CommentRepository();

        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.reject(new Error('comment tidak ditemukan')));    
        mockCommentRepository.verifyCommentOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.deleteComment = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const deleteCommentUseCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
        });

        // Action & Assert
        await expect(deleteCommentUseCase.execute(useCasePayload))
            .rejects
            .toThrowError('comment tidak ditemukan');
    })

    it('should throw error if use case payload not contain comment id', async () => {
        // Arrange
        const useCasePayload = {};
        const deleteCommentUseCase = new DeleteCommentUseCase({});

        // Action & Assert
        await expect(deleteCommentUseCase.execute(useCasePayload))
            .rejects
            .toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_COMMENT_ID');
    })

    it('should throw error if comment id not string', async () => {
        // Arrange
        const useCasePayload = {
            commentId: 123,
        };
        
        const deleteCommentUseCase = new DeleteCommentUseCase({});
        
        // Action & Assert
        await expect(deleteCommentUseCase.execute(useCasePayload))
            .rejects
            .toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    })

    it('should orchestrating the delete comment action correctly', async () => {
        // Arrange
        const useCasePayload = {
            commentId: 'comment-123',
        };

        const mockCommentRepository = new CommentRepository();

        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentOwner = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.deleteComment = jest.fn()
            .mockImplementation(() => Promise.resolve());

        const deleteCommentUseCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
        });

        // Act
        await deleteCommentUseCase.execute(useCasePayload);

        // Assert
        expect(mockCommentRepository.verifyCommentAvailability)
            .toHaveBeenCalledWith(useCasePayload.commentId);
        expect(mockCommentRepository.verifyCommentOwner)
            .toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.owner);
        expect(mockCommentRepository.deleteComment)
            .toHaveBeenCalledWith(useCasePayload.commentId);
    })
})