const {
  HTTP_HOST,
  HTTP_PORT,
  HTTPS_HOST,
  HTTPS_PORT,
  CA_KEY,
  CA_CERT,
  CA_PASS,
} = process.env

module.exports = {
  http:  {
    host: HTTP_HOST || 'localhost',
    port: HTTP_PORT || 8080,
  },
  https: {
    host: HTTPS_HOST || 'localhost',
    port: HTTPS_PORT || 8443,
  },
  CA: {
    key:  CA_KEY  || '.cert/rootCA.key',
    cert: CA_CERT || '.cert/rootCA.pem',
    pass: CA_PASS || 'pass'
  }
}
