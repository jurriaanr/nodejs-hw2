import {handlers} from './handlers'
import {handlers as userHandlers} from './handlers/user'
import {handlers as tokenHandlers} from './handlers/token'
import {handlers as validateHandlers} from './handlers/validate'
import {handlers as menuHandlers} from './handlers/menu'
import {handlers as orderHandlers} from './handlers/order'
import {handlers as paymentHandlers} from './handlers/payment'

const router = {
    'user': userHandlers,
    'token': tokenHandlers,
    'validate': validateHandlers,
    'menu': menuHandlers,
    'order': orderHandlers,
    'pay': paymentHandlers,
}

/**
 * Match path to a handler
 * @param path
 * @param method
 * @returns {*}
 */
export const getRouteHandler = (path, method) => {
    if (router.hasOwnProperty(path)) {
        const handler = router[path]
        if (handler.hasOwnProperty(method)) {
            return handler[method]
        }

        return handlers.methodNotAllowed
    }

    return handlers.notFound
}
