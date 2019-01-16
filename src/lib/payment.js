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



        res.on('data', (data) => {
            buffer += decoder.write(data)
        })

        res.on('end', () => {
            buffer += decoder.end()
            const body = parseJsonToObject(buffer)
            resolve(body)
        })
    })

    req.on('error', (e) => {
        reject(Error(`Payment charge could not be sent: ${e.message}`))
    })

    req.write(payload)
    req.end()
})

// curl https://api.stripe.com/v1/charges \
//     -u sk_test_rnSqokqQpSpkG47a8Kro1Ybz: \
//   -d amount=999 \
//   -d currency=usd \
//   -d source=tok_visa \
//   -d receipt_email="jenny.rosen@example.com"


// {
//     "id": "ch_1C89EzBGVvYIumpFuowNjRvd",
//     "object": "charge",
//     "amount": 999,
//     "amount_refunded": 0,
//     "application": null,
//     "application_fee": null,
//     "balance_transaction": "txn_1C89EzBGVvYIumpFonIVQCqz",
//     "captured": true,
//     "created": 1521647561,
//     "currency": "usd",
//     "customer": null,
//     "description": null,
//     "destination": null,
//     "dispute": null,
//     "failure_code": null,
//     "failure_message": null,
//     "fraud_details": {},
//     "invoice": null,
//     "livemode": false,
//     "metadata": {},
//     "on_behalf_of": null,
//     "order": null,
//     "outcome": {
//     "network_status": "approved_by_network",
//         "reason": null,
//         "risk_level": "normal",
//         "risk_score": "23", // Provided only with Stripe Radar for Fraud Teams
//         "seller_message": "Payment complete.",
//         "type": "authorized"
// },
//     "paid": true,
//     "receipt_email": "jenny.rosen@example.com",
//     "receipt_number": null,
//     "refunded": false,
//     "refunds": {
//     "object": "list",
//         "data": [],
//         "has_more": false,
//         "total_count": 0,
//         "url": "/v1/charges/ch_1C89EzBGVvYIumpFuowNjRvd/refunds"
// },
//     "review": null,
//     "shipping": null,
//     "source": {
//     "id": "card_1C89EzBGVvYIumpFRu1TaQSW",
//         "object": "card",
//         "address_city": null,
//         "address_country": null,
//         "address_line1": null,
//         "address_line1_check": null,
//         "address_line2": null,
//         "address_state": null,
//         "address_zip": null,
//         "address_zip_check": null,
//         "brand": "Visa",
//         "country": "US",
//         "customer": null,
//         "cvc_check": null,
//         "dynamic_last4": null,
//         "exp_month": 8,
//         "exp_year": 2019,
//         "fingerprint": "hJ3Ax4VGoOj4H6mu",
//         "funding": "credit",
//         "last4": "4242",
//         "metadata": {},
//     "name": null,
//         "tokenization_method": null
// },
//     "source_transfer": null,
//     "statement_descriptor": null,
//     "status": "succeeded",
//     "transfer_group": null
// }