const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository Interface', () => {
    it('should throw error when invoke abstract behavior', async () => {
        const threadRepository = new ThreadRepository();

        await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(threadRepository.getThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(threadRepository.verifyThreadAvailability('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(threadRepository.updateThread('', {})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(threadRepository.deleteThread('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    })
})