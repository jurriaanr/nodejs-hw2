import {directory as userDir} from './user'
import {deleter, getter, tokenized} from '../lib/handler'
import * as storage from '../lib/storage'
import {createRandomString} from '../lib/util'
import {passwordHash} from '../lib/hash'
import {allFieldsHaveValue, defaultField, getValue, mapFields} from '../lib/forms'

// the dir that will store the user data
export const directory = 'token'

// the expected fields for post/put actions and their getter functions
const fields = [
    {...defaultField, name: 'user'},
    {...defaultField, name: 'password'},
]

const getExpirationTime = () => Date.now() + (1000 * 60 * 60)

// the request handler functions
export const handlers = {
    get: tokenized(getter(directory)),
    // custom post for creating tokens
    post: async (data, callback) => {
        const mappedFields = mapFields(fields, data)
        if (allFieldsHaveValue(mappedFields)) {
            try {
                const user = await storage.read(userDir, data.params.user)
                if (passwordHash(data.body.password, user.salt) === user.password) {
                    const tokenId = createRandomString(20)
                    const token = {
                        token: tokenId,
                        expires: getExpirationTime(),
                        user: mappedFields.find((field) => field.name === 'user').value,
                    }

                    await storage.create(directory, tokenId, token)
                    return callback(200, token)
                } else {
                    return callback(400, {Error: 'Invalid password'})
                }
            } catch (e) {
                return callback(500, {Message: e.message})
            }
        } else {
            return callback(400, {Error: 'Missing required fields'})
        }
    },
    // custom put for updating expire date
    put: tokenized(async (data, callback) => {
        const id = getValue(data.params.id)
        const extend = getValue(data.params.extend, 'boolean', val => val === true)

        if (id && extend) {
            try {
                const token = await storage.read(directory, id)

                if (token.expires > Date.now()) {
                    token.expires = getExpirationTime()
                    await storage.update(directory, id, token)

                    return callback(200, {token})
                } else {
                    return callback(400, {Error: 'Token already expired'})
                }
            } catch (e) {
                return callback(500, {Message: e.message})
            }
        } else {
            return callback(400, {Error: 'Missing required fields'})
        }
    }),
    delete: tokenized(deleter(directory)),
}
