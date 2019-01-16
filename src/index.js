import {config} from './config'
import {httpServer, httpsServer} from './server'

const httpPort = config.httpPort || 3000
const httpsPort = config.httpsPort || 3001

httpServer.listen(httpPort, () => console.log(`Listening on port ${httpPort}`))
httpsServer.listen(httpsPort, () => console.log(`Listening on port ${httpsPort} for https`))
