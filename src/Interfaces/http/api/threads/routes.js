const routes = (handler) => ([
    {
        method: 'POST',
        path: '/threads',
        handler: handler.postThreadHandler,
    },
    {
        method: 'POST',
        path: '/threads/{threadId}/comments',
        handler: handler.postCommentHandler,
    },
    {
        method: 'DELETE',
        path: '/threads/{threadId}/comments/{commentId}',
        handler: handler.deleteCommentHandler,
    },
    {
        method: 'GET',
        path: '/threads/{threadId}',
        handler: handler.getThreadDetailHandler,
    }
])

module.exports = routes