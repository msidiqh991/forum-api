const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the add comment action correctly', async () => {
        const useCasePayload = {
            content: 'sebuah comment disuatu thread',
        };

        const mockAddedComment = new AddComment({
            id: 'comment-123',
            content: useCasePayload.content,
        });
        
        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.addComment = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedComment));
        
        const addCommentUseCase = new AddCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        const addedComment = await addCommentUseCase.execute(
            useCasePayload,
            'user-123',
            'thread-123',
        )

        expect(addedComment).toStrictEqual(new AddComment({
            id: 'comment-123',
            content: useCasePayload.content,
            owner: 'user-123',
        }));
        expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
        expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith('comment-123');
        expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new NewComment({
            content: useCasePayload.content,
            owner: 'user-123',
            threadId: 'thread-123',
        }));
    });

    /**
     * Menguji jika use case melempar error ketika thread tidak tersedia.
     */
    it('should throw error when thread not available', async () => {
        const useCasePayload = {
            content: 'sebuah comment disuatu thread',
        };

        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn()
            .mockImplementation(() => Promise.reject(new Error('THREAD_NOT_FOUND')));

        const addCommentUseCase = new AddCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
        });

        await expect(addCommentUseCase.execute(
            useCasePayload,
            'user-123',
            'thread-123',
        )).rejects.toThrowError('THREAD_NOT_FOUND');
    });
});