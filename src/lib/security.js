// import {directory as tokenDir} from '../handlers/token'
import {read, exists} from './storage'
import * as storage from './storage'
import {directory as userDir, pullConverter} from '../handlers/user'

/**
 * Verify that the token exists and the date is still valid
 * @param tokenId
 * @returns {Promise<*>}
 */
export const verifyToken = async (tokenId) => {
    // if we import this variable like we should the whole thing dies?
    const tokenDir = 'token'
    if (tokenId) {
        if (exists(tokenDir, tokenId)) {
            const token = await read(tokenDir, tokenId)
            return {
                valid: token.expires > Date.now(),
                token: token,
            }
        }
    }
    return {valid: false, token: null}
}

/**
 * Get the user data from a token
 * @param token
 * @returns {Promise<*>}
 */
export const getUserByToken = async (token) => {
    return await getUserById(token.user)
}

/**
 * Get a user by id
 * @param id
 * @returns {Promise<*>}
 */
export const getUserById = async (id) => {
    if (storage.exists(userDir, id)) {
        try {
            return await storage.read(userDir, id, pullConverter)
        } catch (e) {
            return null
        }
    }
    return null
}
