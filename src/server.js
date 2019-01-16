import {createServer} from 'http'
import {createServer as createHttpsServer} from 'https'
import {parse} from 'url'
import {StringDecoder} from 'string_decoder'
import {readFileSync} from 'fs'
import {getRouteHandler} from './router'
import {parseJsonToObject} from './lib/util'

/**
 * Setup http and https server
 * @param request
 * @param response
 */
const serverHandler = (request, response) => {
    const parsedUrl = parse(request.url, true)
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')
    const method = request.method.toLowerCase()
    const queryString = parsedUrl.query
    const headers = request.headers

    const decoder = new StringDecoder('utf-8')
    let buffer = ''

    request.on('data', (data) => {
        buffer += decoder.write(data)
    })

    request.on('end', () => {
        buffer += decoder.end()

        const requestHandler = getRouteHandler(path, method)
        const body = parseJsonToObject(buffer)
        const data = {
            path,
            method,
            headers,
            queryString,
            body: body,
            params: {...headers, ...queryString, ...body},
            isPost () {
                return this.method === 'post'
            }
        }

        console.log(`Request ${method.toUpperCase()} /${path}`)

        requestHandler(data, (status = 200, responseData = {}) => {
            const responseBody = JSON.stringify(responseData)

            response.setHeader('Content-Type', 'application/json')
            response.writeHead(status)
            response.end(responseBody)
        })
    })
}

// Export servers

export const httpServer = createServer(serverHandler)
export const httpsServer = createHttpsServer({
    key: readFileSync('./ssl/key.pem'),
    cert: readFileSync('./ssl/cert.pem'),
}, serverHandler)

