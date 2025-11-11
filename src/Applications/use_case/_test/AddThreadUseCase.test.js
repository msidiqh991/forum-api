const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
    /**
     * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
     */
    it('should orchestrating the add thread action correctly', async () => {
        const useCasePayload = {
            title: 'sebuah thread',
            body: 'sebuah body thread',
        };

        const mockAddedThread = new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            // body: useCasePayload.body,
            owner: 'user-123',
        });

        const mockThreadRepository = new ThreadRepository();
        
        mockThreadRepository.addThread = jest.fn()
            .mockImplementation(() => Promise.resolve(mockAddedThread));
        
        // Creating use case instance
        const addThreadUseCase = new AddThreadUseCase({
            threadRepository: mockThreadRepository,
        })

        const addedThread = await addThreadUseCase.execute(useCasePayload, 'user-123');

        expect(addedThread).toStrictEqual(new AddedThread({
            id: 'thread-123',
            title: useCasePayload.title,
            // body: useCasePayload.body,
            owner: 'user-123',
        }));

        expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new NewThread({
            title: useCasePayload.title,
            body: useCasePayload.body,
            owner: 'user-123',
        }));
    });
})