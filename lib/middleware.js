'use strict'

const onFinished = require('on-finished')
const onHeaders = require('on-headers')

const { Logger } = require('./logger')

exports.middleware = function (req, res, next) {
  if (req.logger) {
    return
  }

  req.logger = new Logger()

  function recordStartTime () {
    this._startAt = process.hrtime()
  }

  function milliseconds (digits) {
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
      (res._startAt[1] - req._startAt[1]) * 1e-6

    return ms.toFixed(digits === undefined ? 3 : digits)
  }

  recordStartTime.call(req)
  onHeaders(res, recordStartTime)

  onFinished(res, () => {
    const message = `${req.method} ${req.url} - ${res.status} in ${milliseconds()} ms`

    if (res.status < 400) { // Any non-error codes should be logged in debug mode
      req.logger.debbug(message)
    } else if (res.status < 500) { // Any client-fault codes should be logged in warn mode
      req.logger.warn(message)
    } else { // Any server-fault codes shuold be logged in error mode
      req.logger.error(message)
    }
  })

  next()
}