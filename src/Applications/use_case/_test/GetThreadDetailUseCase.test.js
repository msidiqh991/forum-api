const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
    it('should orchestrating the get thread detail action correctly', async () => {
        const threadId = 'thread-123';

        const mockAddedThread = new AddedThread({
            id: threadId,
            title: 'sebuah thread',
            body: 'sebuah body thread',
            owner: 'msidiqh',
        });

        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn()
            .mockImplementation(() => Promise.resolve());
        mockThreadRepository.getThreadById = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedThread));

        const getThreadDetailUseCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
        });

        const thread = await getThreadDetailUseCase.execute(threadId);

        expect(thread).toStrictEqual(new AddedThread({
            id: threadId,
            title: 'sebuah thread',
            body: 'sebuah body thread',
            owner: 'msidiqh',
         }));
        expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
        expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
    })

    it('should throw error when thread not available', async () => {
        const threadId = 'thread-123';

        const mockThreadRepository = new ThreadRepository();

        mockThreadRepository.verifyThreadAvailability = jest.fn()
            .mockImplementation(() => Promise.reject(new Error('THREAD_NOT_FOUND')));
        
        const getThreadDetailUseCase = new GetThreadDetailUseCase({
            threadRepository: mockThreadRepository,
        });

        await expect(getThreadDetailUseCase.execute(threadId))
            .rejects
            .toThrowError('THREAD_NOT_FOUND');
        expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    })
})