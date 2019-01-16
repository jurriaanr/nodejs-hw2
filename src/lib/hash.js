import {createHash, randomBytes} from 'crypto'

/**
 * Create a (md5) hash for use as id
 * @param data
 * @param salt
 * @returns {string}
 */
export const hash = (data, salt = null) => createHash('md5', salt).update(data).digest('hex')

/**
 * Create a more secure sha256 hash with a salt for use as a stored password
 * @param data
 * @param salt
 * @returns {string}
 */
export const passwordHash = (data, salt) => createHash('sha256', salt).update(data).digest('hex')

/**
 * Create a random salt
 * @returns {string}
 */
export const getSalt = () => randomBytes(16).toString('hex')
