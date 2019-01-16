import {config} from '../config'
import {request} from 'https'
import {stringify} from 'querystring'
import {StringDecoder} from 'string_decoder'
import {parseJsonToObject} from './util'
import {calculateTotal} from './order'

const apiUrl = 'https://api.stripe.com/v1/'

/**
 * Send a payment
 * @returns {Promise<object>}
 * @param order
 * @param user
 * @param paymentToken
 */
export const charge = (order, user, paymentToken) => new Promise((resolve, reject) => {
    // payload for stripe api
    const payload = stringify({
        amount: calculateTotal(order),
        currency: 'eur',
        source: paymentToken,
        receipt_email: user.email,
        description: `Order ${order.id}`
    })

    const req = request(`${apiUrl}charges`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payload),
            'Authorization': `Basic ${Buffer.from(`${config.stripe.secret}:`).toString('base64')}`,
        },
    }, (res) => {
        const decoder = new StringDecoder('utf-8')
        let buffer = ''
        if (res.statusCode !== 200) {
            res.on('data', (data) => {
                buffer += decoder.write(data)
            })

            res.on('end', () => {
                buffer += decoder.end()
                console.log(buffer)
            })

            return reject(Error(`Payment charge could not be sent (status: ${res.statusCode})`))
        }

        // get the result object from stripe
        res.on('data', (data) => {
            buffer += decoder.write(data)
        })

        // finish getting the result object from stripe
        res.on('end', () => {
            buffer += decoder.end()
            const body = parseJsonToObject(buffer)
            // resolve promise
            resolve(body)
        })
    })

    req.on('error', (e) => {
        reject(Error(`Payment charge could not be sent: ${e.message}`))
    })

    req.write(payload)
    req.end()
})
