// simple console.log that prints colourful timestamps
const logger = (() => {
  const timestamp = () => {}
  timestamp.toString = () => '[' + (new Date).toISOString() + ']'
  return {
    info: console.log.bind(console, '\x1b[33m%s\x1b[0m', timestamp),
    log:  console.log.bind(console, '\x1b[32m%s\x1b[0m', timestamp),
    err:  console.log.bind(console, '\x1b[31m%s\x1b[0m', timestamp)
  }
})()

module.exports = logger
