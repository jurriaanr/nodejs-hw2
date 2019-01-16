import {defaultPushConverter, hiddenFieldConverter} from '../lib/util'
import {getter, poster, putter, deleter, tokenized} from '../lib/handler'
import {addressValidator, defaultField} from '../lib/forms'
import {read, update} from '../lib/storage'
import {calculateTotal, itemsValidator} from '../lib/order'
import {directory as userDir} from './user'

// the dir that will store the user data
export const directory = 'order'

// the expected fields for post/put actions and their getter functions
const fields = [
    {...defaultField, name: 'items', type: 'object', rule: itemsValidator},
    {...defaultField, name: 'address', type: 'object', rule: addressValidator},
]

// default converter when putting orders in storage
const pushConverter = async (fields, obj = {}, data = null) => {
    const order = defaultPushConverter(fields, obj, data)

    // only when creating a new user
    if(data.isPost()){
        order.date = Date.now()
        order.total = calculateTotal(order)
        order.paid = false
    }

    return order
}

// the request handler functions
export const handlers = {
    get: tokenized(getter(directory)),
    post: tokenized(async (data, callback) => {
        poster(directory, fields, pushConverter)(data, async (status, result) => {
            if (status === 200) {
                // add order to user
                data.user.orders.push(result.Id)
                try {
                    await update(userDir, data.user.id, data.user)
                    callback(200, result)
                } catch (e) {
                    return callback(500, {Message: 'Order could not be saved to user'})
                }
            } else {
                return callback(status, result)
            }
        })
    }),
    put: tokenized(async (data, callback) => {
        try {
            const order = await read(directory, data.params.id)
            if(order.paid){
                return callback(400, {Message: "Order is already paid for"})
            }
            putter(directory, fields, pushConverter)
        } catch (e) {
            return callback(500, {Message: 'Order could not be read'})
        }
    }),
    delete: tokenized(async (data, callback) => {
        deleter(directory)(data, async (status, result) => {
            if (status === 200) {
                // remove from user
                data.user.orders = data.user.orders.filter((orderId) => {
                    return orderId !== data.params.id
                })
                try {
                    await update(userDir, data.user.id, data.user)
                    callback(200, result)
                } catch (e) {
                    return callback(500, {Message: 'Order could not be removed from user'})
                }
            } else {
                return callback(status, result)
            }
        })
    }),
}
