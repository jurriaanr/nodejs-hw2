import {randomBytes} from 'crypto'
import {NO_VALUE} from './forms'
import {hash} from './hash'

/**
 * wrap json parse with try/catch
 * @param str
 * @returns {*}
 */
export const parseJsonToObject = (str) => {
    try {
        return JSON.parse(str)
    } catch (e) {
        console.log(`Could not parse JSON: ${e.message}`)
        return {}
    }
}

/**
 * Create a random id string with little chance of duplication
 * @returns {string}
 */
export const createId = () => hash(`${Date.now()}${createRandomString(5)}`)

/**
 * Create a random string based on hex chars
 * @param count
 * @returns {string}
 */
export const createRandomString = (count = 20) => randomBytes(count).toString('hex')

/**
 * default function for converting data from json file to object
 * @param data
 * @returns {*}
 */
export const defaultPullConverter = data => data

/**
 * default function for converting data from object to data stored as json
 * @param fields
 * @param obj
 * @param data
 * @param addUser
 */
export const defaultPushConverter = (fields, obj = {}, data = null, addUser = true) => {
    obj = fields.reduce((acc, field) => {
        // skip fields that have no value
        if (field.value !== NO_VALUE) {
            acc[field.name] = field.value
        }
        return acc
    }, obj)

    if (addUser && data && data.user) {
        obj.user = data.user.id
    }

    return obj
}

/**
 * Check if object belongs to user
 * @param user
 * @param obj
 * @returns {*|boolean}
 */
export const defaultUserChecker = (user, obj) => user && (user.id === obj.user)

/**
 * default pull converter that will removed stored fields from object that we do not want to show users like password
 * @param hiddenFields
 * @returns {function(*): *}
 */
export const hiddenFieldConverter = (hiddenFields) => (data) => {
    hiddenFields.forEach((field) => delete data[field])
    return data
}

