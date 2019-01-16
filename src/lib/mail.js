import {config} from '../config'
import {request} from 'https'
import {stringify} from 'querystring'

const apiUrl = 'https://api.mailgun.net/v3/'

export const message = {
    from: config.mailgun.from,
    to: '',
    subject: '',
    body: '',
    footer: 'That pizza place, make pizza great again!',
    html: function() {
        return this.template()
    },
    template() {
        return `
        <html>
            <body>
                <div style="text-align: center">
                    <h1><img src="https://thatpizzaplace.nl/thatpizzaplace-med.png" alt="That Pizza Place" /></h1>
                </div>
                <section style="width: 750px; margin: auto; background-color: antiquewhite; padding: 20px; font-family: Tahoma, Geneva, sans-serif; color: #462300;">
                    ${this.body
                        .replace(/\n/g, '\n<br>')
                        .replace(/(#+)([^#]+)#+/g, (m, ...g) => `<h${g[0].length+1}>${g[1]}</h${g[0].length+1}>`)
                    }
                </section>
                <div style="border-top: 1px solid #ccc; margin-top: 30px; padding: 30px; text-align: center; font-size: 0.8em; font-family: Tahoma, Geneva, sans-serif; color: #462300;">
                    ${this.footer}
                </div>
            </body>
        </html>
        `.trim()
    }
}

/**
 * Send a mail message
 * @param message
 * @returns {Promise<object>}
 */
export const mail = (message) => new Promise((resolve, reject) => {
    const payload = stringify({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.body,
        html: message.html(),
    })

    const req = request(`${apiUrl}${config.mailgun.apiDomain}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payload),
            'Authorization': `Basic ${Buffer.from(`api:${config.mailgun.apiKey}`).toString('base64')}`,
        },
    }, (res) => {
        if (res.statusCode === 200) {
            resolve(message)
        } else {
            reject(Error(`E-mail could not be sent (status: ${res.statusCode})`))
        }
    })

    req.on('error', (e) => {
        reject(Error(`E-mail could not be sent: ${e.message}`))
    })

    req.write(payload)
    req.end()
})