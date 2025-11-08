const NewReply = require('../../Domains/replies/entities/NewReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, owner, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const newReply = new NewReply({
      ...useCasePayload,
      owner,
      threadId,
      commentId,
    });

    const addedReply = await this._replyRepository.addReply(newReply);
    return new AddedReply({
      id: addedReply.id,
      content: addedReply.content,
      owner: addedReply.owner,
    });
  }
}

module.exports = AddReplyUseCase;
