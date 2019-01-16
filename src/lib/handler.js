import * as storage from './storage'
import {getUserByToken, verifyToken} from './security'
import {
    createId,
    defaultPullConverter,
    defaultPushConverter, defaultUserChecker,
} from './util'
import {allFieldsHaveValue, getMissingFields, mapFields, someFieldsHaveValue} from './forms'

// perform authorization
export const tokenized = (handler) => async (data, callback) => {
    try {
        // check expire date
        const verifyTokenResult = await verifyToken(data.params.token)
        if (verifyTokenResult.valid) {
            const user = await getUserByToken(verifyTokenResult.token)

            if (user && user.validated) {
                // add token and user to the request data
                data.token = verifyTokenResult.token
                data.user = user
                return handler(data, callback)
            }
        }
        return callback(403, {Message: 'Not logged in'})
    } catch (e) {
        return callback(500, {Message: e.message})
    }
}

// function that gets an object from storage based on the input from the user
export const getter = (dirName, converter = defaultPullConverter, userChecker = defaultUserChecker) => async (data, callback) => {
    // get id from request (from url, or body or even headers)
    const id = data.params.id

    try {
        // check if the id exists in storage
        if (id && storage.exists(dirName, id)) {
            // get object from storage and return to callback function
            const obj = await storage.read(dirName, id, converter)

            if (!userChecker || userChecker(data.user, obj)) {
                return callback(200, obj)
            } else {
                return callback(403, 'Forbidden')
            }
        }
        return callback(404, {Message: 'Not found'})
    } catch (e) {
        console.log(e.message)
        return callback(500, {Message: e.message})
    }
}

// function that creates and stores an object based on the input from the user
export const poster = (dirName, fields = [], converter = defaultPushConverter) => async (data, callback) => {
    // set the value from request for each required field
    fields = mapFields(fields, data)

    // if every required field has a value
    if (allFieldsHaveValue(fields)) {
        // create id for storage
        const id = createId()

        // store if the object does not yet exist (in case user mistakes post for pull f.e.)
        if (!storage.exists(dirName, id)) {
            try {
                // use the given converter to convert the object for storage
                const obj = await converter(fields, {id}, data)

                await storage.create(dirName, id, obj)
                return callback(200, {Message: 'Resource created', Id: id})
            } catch (e) {
                console.log(e.message)
                return callback(500, {Error: 'Could not save resource'})
            }
        }
        return callback(400, {Error: 'Resource already exists'})
    } else {
        return callback(400, {Error: 'Missing or invalid required fields', Fields: getMissingFields(fields)})
    }
}

// function that updates an object in storage based on the input from the user
export const putter = (dirName, fields = [], converter = defaultPushConverter, userChecker = defaultUserChecker) => async (data, callback) => {
    // get id from request
    const id = data.params.id

    if (id && storage.exists(dirName, id)) {
        try {
            // read in the full object
            const obj = await storage.read(dirName, id)

            if (!userChecker || userChecker(data.user, obj)) {
                // map all fields (all are optional)
                fields = mapFields(fields, data)

                // check if at least 1 value is set
                if (someFieldsHaveValue(fields)) {
                    // use the given converter to convert the object for storage
                    await converter(fields, obj, data)
                    await storage.update(dirName, id, obj)
                    return callback(200, {Message: 'Resource updated'})
                } else {
                    return callback(400, {Error: 'Missing required fields'})
                }
            } else {
                return callback(403, 'Forbidden')
            }
        } catch (e) {
            return callback(500, {Message: e.message})
        }
    }

    return callback(404, {Message: 'Not found'})
}

// function that deletes an object from storage
export const deleter = (dirName, userChecker = defaultUserChecker) => async (data, callback) => {
    // check the id for validity
    const id = data.params.id
    try {
        if (id && storage.exists(dirName, id)) {
            const obj = await storage.read(dirName, id)

            if (!userChecker || userChecker(data.user, obj)) {
                await storage.remove(dirName, id)
                return callback(200, {Message: 'Resource deleted'})
            } else {
                return callback(403, 'Forbidden')
            }
        }

        return callback(404, {Message: 'Resource not found'})
    } catch (e) {
        return callback(500, {Message: 'Resource could not be deleted'})
    }
}
