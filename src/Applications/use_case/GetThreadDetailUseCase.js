const GetDetailThread = require("../../Domains/threads/entities/GetDetailThread");

class GetThreadDetailUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(threadId) {
        await this._threadRepository.verifyThreadAvailability(threadId);
        const thread = await this._threadRepository.getThreadById(threadId);
        return new GetDetailThread(thread);
    }
}

module.exports = GetThreadDetailUseCase;