export const handlers = {}

handlers.notFound = (data, callback) => {
    callback(404, 'Not Found')
}

handlers.methodNotAllowed = (data, callback) => {
    callback(405, 'Method not allowed')
}

handlers.ping = {
    get: (data, callback) => {
        callback(200, {Message: 'Ping!'})
    },
}
