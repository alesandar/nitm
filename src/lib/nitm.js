const https = require('https')
const http = require('http')
const { createConnection } = require('net')
const { createSecureContext } = require('tls')
const { readFileSync } = require('fs')
const { decryptRsaPrivateKey, certificateFromPem } = require('node-forge').pki
const { createCertificatePair } = require('./cert')
const { log, err } = require('./logger')
const config = require('./config')

const connectHandler = (req, res) => {
  res.write(`HTTP/${req.httpVersion} 200 OK\r\n\r\n`)
  const conn = createConnection(config.https.port, config.http.host)
  res.on('close', () => res.unpipe(conn))
  res.on('error', () => res.unpipe(conn))
  res.pipe(conn)
  conn.pipe(res)
}

const requestHandler = async(mod, req, res) => {
  let request, protocol

  if (mod === https){
    request = https.request
    protocol = 'HTTPS'
    req.url = `https://${req.headers.host}${req.url}`
  } else {
    request = http.request
    protocol = 'HTTP'
  }

  const proxRes = await new Promise(resolve => {
    let { headers, method } = req
    let { host, port, pathname, search } = new URL(req.url)

    let path = `${pathname}${search}`

    log(`${protocol} ${method} ${host}${path !== '/' ? path : ''}`)

    const proxReq = request({ headers, method, host, port, path }, resolve)

    proxReq.on('error', e => err(`Request error: ${e.message}`))

    req.pipe(proxReq)
  })

  res.writeHead(proxRes.statusCode, proxRes.headers)
  proxRes.pipe(res)
  res.on('close', () => proxRes.destroy())

  return proxRes
}

const initHTTP = () => new Promise(resolve => {
  const server = http.createServer(requestHandler.bind(null, http))

  server.on('connect', connectHandler)
  server.listen(config.http.port, config.http.host, () => {
    log(`HTTP server is ready and listening on ${config.http.host}:${config.http.port}`)
    resolve(server)
  })
})

const initHTTPS = () => new Promise(resolve => {
  const CA = {
    key: decryptRsaPrivateKey(readFileSync(config.CA.key), config.CA.pass),
    cert: certificateFromPem(readFileSync(config.CA.cert))
  }

  const { key, cert } = createCertificatePair(CA.key, CA.cert, config.http.host)
  const SNICallback = (host, cb) => cb(null, createSecureContext(createCertificatePair(CA.key, CA.cert, host)))

  const server = https.createServer({ key, cert, SNICallback }, (req, res) => requestHandler(https, req, res))

  server.listen(config.https.port, config.http.host, () => {
    log(`HTTPS server is ready and listening on ${config.http.host}:${config.http.port}`)
    resolve(server)
  })
})

module.exports = { initHTTPS, initHTTP }
