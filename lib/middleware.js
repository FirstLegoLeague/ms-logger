'use strict'

const router = require('express').Router()
const onFinished = require('on-finished')
const onHeaders = require('on-headers')

const { Logger } = require('./logger')

router.post('/log/:level', (req, res) => {
  req.logger = new Logger()
  const level = req.params.level.toLowerCase()

  try {
    switch (level) {
      case 'debug':
        req.logger.debug(req.body.message)
        break
      case 'info':
        req.logger.info(req.body.message)
        break
      case 'warn':
        req.logger.warn(req.body.message)
        break
      case 'error':
        req.logger.error(req.body.message)
        break
      case 'fatal':
        req.logger.fatal(req.body.message)
        break
      default:
        req.logger.info(req.body.message)
    }
    res.status(201).send()
  } catch (e) {
    res.status(500).send(e.message)
  }

})


router.use((req, res, next) => {
  if (req.logger) {
    return
  }

  req.logger = new Logger()

  function recordStartTime () {
    this._startAt = process.hrtime()
  }

  function milliseconds (digits) {
    if (!req._startAt || !res._startAt) {
      // Missing request and/or response start time
      return
    }

    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
      (res._startAt[1] - req._startAt[1]) * 1e-6

    return ms.toFixed(digits === undefined ? 3 : digits)
  }

  recordStartTime.call(req)
  onHeaders(res, recordStartTime)

  onFinished(res, () => {
    const message = `${req.method} ${req.url} - ${res.statusCode} in ${milliseconds()} ms`

    if (res.statusCode < 400) { // Any non-error codes should be logged in debug mode
      req.logger.debug(message)
    } else if (res.statusCode < 500) { // Any client-fault codes should be logged in warn mode
      req.logger.warn(message)
    } else { // Any server-fault codes should be logged in error mode
      req.logger.error(message)
    }
  })

  next()
})

module.exports.middlewere = router
