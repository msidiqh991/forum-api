const AddedThread = require("../../Domains/threads/entities/AddedThread");

class GetThreadDetailUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(threadId) {
        await this._threadRepository.verifyThreadAvailability(threadId);
        const thread = await this._threadRepository.getThreadById(threadId);
        return new AddedThread(thread);
    }
}

module.exports = GetThreadDetailUseCase;