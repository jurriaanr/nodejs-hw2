import {createRandomString, defaultPushConverter, hiddenFieldConverter} from '../lib/util'
import {passwordHash, getSalt} from '../lib/hash'
import {getter, poster, putter, deleter, tokenized} from '../lib/handler'
import {addressValidator, defaultField, NO_VALUE} from '../lib/forms'
import {remove} from '../lib/storage'
import {mail, message} from '../lib/mail'

// the dir that will store the user data
export const directory = 'user'

// simple email check
export const emailChecker = (val) => val.match(/^[^@]+\@[\w\.-]+\.[a-z]{2,}$/i)

// the expected fields for post/put actions and their getter functions
const fields = [
    {...defaultField, name: 'name'},
    {...defaultField, name: 'address', type: 'object', rule: addressValidator},
    {...defaultField, name: 'email', rule: emailChecker},
    {...defaultField, name: 'password'},
    {...defaultField, name: 'tos', type: 'boolean', rule: val => val === true},
]

// default converter when getting users from storage
export const pullConverter = hiddenFieldConverter(['password', 'salt', 'validationCode'])

// default converter when putting users in storage
const pushConverter = async (fields, obj = {}, data = null) => {
    const user = defaultPushConverter(fields, obj, data, false)
    const passwordField = fields.find((field) => field.name === 'password')

    if (passwordField.value !== NO_VALUE) {
        const salt = getSalt()
        user.password = passwordHash(passwordField.value, salt)
        user.salt = salt
    }

    // only when creating a new user
    if(data.isPost()){
        user.validationKey = createRandomString(30)
        user.validated = false

        const validationMessage = {...message, to: user.email, subject: 'Validate your pizza place account', body: `
            #Welcome#
            Hi ${user.name},
            Welcome at that pizza place! To validate your account, please use our validation api with the following validationKey:
            
            ${user.id}_${user.validationKey}
            
            Thank you for registering your account!
            That pizza place   
        `}

        // send validation mail to user
        await mail(validationMessage)

        user.orders = []
    }

    return user
}

// custom user checker
const userChecker = (user, obj) => user && (user.id === obj.id)

// the request handler functions
export const handlers = {
    get: tokenized(getter(directory, pullConverter, userChecker)),
    post: poster(directory, fields, pushConverter),
    put: tokenized(putter(directory, fields, pushConverter, userChecker)),
    delete: tokenized(async (data, callback) => {
        deleter(directory, userChecker)(data, async (status, result) => {
            if (status === 200) {
                try {
                    // remove user checks
                    const promises = []
                    data.user.orders.forEach((checkId) => {
                        promises.push(remove(checkDir, checkId))
                    })

                    // TODO: delete tokens

                    Promise.all(promises).then(() => callback(200, result))
                } catch (e) {
                    return callback(500, {Message: 'Not all checks could be deleted from user'})
                }
            } else {
                return callback(status, result)
            }
        })
    }),
}
