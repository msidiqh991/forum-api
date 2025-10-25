
class ThreadsHandler {
    constructor(container) {
        this._container = container;
    }

    async postThreadHandler(request, h) {}

    async postCommentHandler(request, h) {}

    async deleteCommentHandler(request, h) {}

    async getThreadDetailHandler(request, h) {}
}

module.exports = ThreadsHandler;