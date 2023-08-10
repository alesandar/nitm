const { initHTTPS, initHTTP } = require('./lib/nitm.js')
const { err, info, log } = require('./lib/logger')
const { host, port } = require('./lib/config').http

// catch all uncaught exception
process.on('uncaughtException', e => e.stack.split('\n').map(e => err(e)))

// main loop
;(async() => {
  info('Starting...')

  await initHTTPS()
  await initHTTP()

  info('Make sure that the root certificates are trusted by your system or application')
  info('For further information, please visit to https://github.com/alesandar/nitm')

  info(`"http://${host}:${port}" is the address of your local the proxy server.`)
})()
