const { existsSync } = require('fs')
const { pki, md } = require('node-forge')
const { rsa, createCertificate, privateKeyToPem, certificateToPem, } = pki
const config = require('./config')

if (!existsSync(config.CA.cert) || !existsSync(config.CA.key)){
  throw Error('CA certificates could not be found. Exiting...')
  process.exit(1)
}

const createCertificatePair = (key, crt, cn) => {
  const keys = rsa.generateKeyPair(2048)
  const cert = createCertificate()

  cert.publicKey = keys.publicKey
  cert.serialNumber = new Date().getTime() + ''
  cert.validity.notBefore = new Date()
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1)
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1)

  cert.setSubject([ { name: 'commonName', value: cn }, { name: 'organizationName', value: 'publicvoidltd' } ])
  cert.setIssuer(crt.subject.attributes)
  cert.setExtensions([ { name: 'subjectAltName', altNames: [ { type: 2, value: cn } ] }, { name: 'extKeyUsage', serverAuth: true } ])

  cert.sign(key, md.sha256.create())

  return {
    key:  privateKeyToPem(keys.privateKey),
    cert: certificateToPem(cert),
  }
}

module.exports = { createCertificatePair }
