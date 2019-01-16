import {directory as userDir} from './user'
import storage from '../lib/storage'

export const handlers = {
    post: async (data, callback) => {
        if (data.params.validationKey) {
            const validationKey = data.params.validationKey
            const [userId, key] = validationKey.split('_')

            if (storage.exists(userDir, userId)) {
                const user = await storage.read(userDir, userId)

                if (key && key === user.validationKey) {
                    user.validated = true
                    delete user.validationKey

                    await storage.update(userDir, userId, user)
                    return callback(200, {Message: `Your account is now validated, start ordering pizza's!`})
                }
            }
        }

        callback(500, {Message: 'Could not validate key'})
    },
}
