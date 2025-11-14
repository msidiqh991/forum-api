const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('DeleteCommentUseCase', () => {
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
            owner: 'user-123',
        };

        const mockCommentRepository = new CommentRepository();

        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentOwner = jest.fn()
            .mockResolvedValue(true);
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

    it('should throw AuthorizationError when user is not the owner of the comment', async () => {
        // Arrange
        const useCasePayload = {
            commentId: 'comment-123',
            owner: 'user-456',
        };

        const mockCommentRepository = {
            verifyCommentAvailability: jest.fn().mockResolvedValue(),
            verifyCommentOwner: jest.fn().mockImplementation(() => {
                throw new AuthorizationError("anda tidak berhak menghapus komentar ini");
            }),
            deleteComment: jest.fn(),
        };

        const deleteCommentUseCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
        });

        // Action & Assert
        await expect(deleteCommentUseCase.execute(useCasePayload))
            .rejects
            .toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when comment to delete not found', async () => {
        // Arrange
        const useCasePayload = {
            commentId: 'comment-123',
            owner: 'user-123',
        };

        const mockCommentRepository = new CommentRepository();

        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentOwner = jest.fn()
            .mockResolvedValue(true);
        mockCommentRepository.deleteComment = jest.fn()
            .mockResolvedValue(0);

        const deleteCommentUseCase = new DeleteCommentUseCase({
            commentRepository: mockCommentRepository,
        });

        // Action & Assert
        await expect(deleteCommentUseCase.execute(useCasePayload))
            .rejects
            .toThrowError(NotFoundError);
    })
})