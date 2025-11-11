const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
    it('should orchestrating the add reply action correctly', async () => {
        const useCasePayload = {
            content: 'sebuah reply disuatu comment',
        }

        const mockAddedReply = {
            id: 'reply-123',
            content: useCasePayload.content,
            owner: 'user-123',
        }

        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockReplyRepository = new ReplyRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockCommentRepository.verifyCommentAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockReplyRepository.addReply = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedReply));

        const addReplyUseCase = new AddReplyUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            replyRepository: mockReplyRepository,
        });
        
        const addedReply = await addReplyUseCase.execute(
            useCasePayload,
            'user-123',
            'thread-123',
            'comment-123',
        );

        expect(addedReply).toStrictEqual(new AddedReply({
            id: 'reply-123',
            content: useCasePayload.content,
            owner: 'user-123',
        }));
        expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith('thread-123');
        expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith('comment-123');
        expect(mockReplyRepository.addReply).toHaveBeenCalledWith(new NewReply({
            content: useCasePayload.content,
            owner: 'user-123',
            threadId: 'thread-123',
            commentId: 'comment-123',
        }));
    })
})