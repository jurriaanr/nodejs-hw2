import {directory as orderDir} from './order'
import {read, update} from '../lib/storage'
import {charge} from '../lib/payment'
import {message, mail} from '../lib/mail'
import {tokenized} from '../lib/handler'
import {getMenuItem} from '../lib/order'

const orderMailBody = (order, user) => `
    Hi ${user.name},

    Thank you for your order! The oven has been filled and is on fire! Here is what we will be making for you:
    ${order.items.reduce((acc, item) => {
        const menuItem = getMenuItem(item.id)
        const itemName = `${menuItem.name}${menuItem.choices ? ` (${item.choice})` : ''}`

        return `${acc}\n${item.quantity} x ${itemName}`
    }, '')}
    
    We will be sending it to your place at ${order.address.street} in ${order.address.city}
    
    Have a good one,
    That Pizza Place
`

export const handlers = {
    post: tokenized(async (data, callback) => {
        const paymentToken = data.params.paymentToken

        try {
            // get the order
            const order = await read(orderDir, data.params.order)

            // check if it has not already been paid
            if (!order.paid) {
                const result = await charge(order, data.user, paymentToken)

                // if the charge order to stripe succeeded
                if (result.paid) {
                    // update the order
                    order.paid = true
                    await update(orderDir, order.id, order)

                    // sent confirmation mail
                    const orderConfirmation = {
                        ...message,
                        to: data.user.email,
                        subject: 'Order confirmation',
                        body: orderMailBody(order, data.user),
                    }
                    await mail(orderConfirmation)

                    return callback(200, {Message: 'Payment successful'})
                }
            }
        } catch (e) {
            console.log(e.message)
        }

        callback(500, {Message: 'Payment did not succeed!'})
    }),
}
