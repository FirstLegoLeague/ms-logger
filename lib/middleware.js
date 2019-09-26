const Router = require('router')
const bodyParser = require('body-parser')
const onHeaders = require('on-headers')

const { Logger } = require('./logger')
const { LOG_LEVEL_NAMES } = require('./log-levels')

const router = Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

router.post('/log/:level', (req, res) => {
  req.logger = new Logger()
  const level = req.params.level.toLowerCase()

  try {
    if (LOG_LEVEL_NAMES.includes(level)) {
      req.logger[level](req.body.message)
    } else {
      req.logger.info(req.body.message)
    }

    res.status(201).send()
  } catch (e) {
    res.status(500).send(e.message)
  }
})

router.use((req, res, next) => {
  if (req.logger) {
    next()
    return
  }

  req.logger = new Logger()

  function recordStartTime () {
    this._startAt = process.hrtime()
  }

  function milliseconds () {
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
      (res._startAt[1] - req._startAt[1]) * 1e-6

    return ms.toFixed(3)
  }

  recordStartTime.call(req)

  onHeaders(res, () => {
    recordStartTime.call(res)
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} from ${req.ip ? req.ip.substr(7) : 'unknown'} in ${milliseconds()} ms`

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

exports.middleware = router
