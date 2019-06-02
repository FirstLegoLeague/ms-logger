const chai = require('chai')
const sinon = require('sinon')
const spies = require('chai-spies')
const proxyquire = require('proxyquire')
const path = require('path')

const expect = chai.expect
chai.use(spies)

const CORRELATION_ID = 'CORRELATION_ID'
const MODULE_NAME = path.basename(path.resolve())
const MOCK_DATE = 1558625994627

const LOG_LEVELS = require('../../lib/log-levels')

const { Logger } = proxyquire('../../lib/logger', {
  '@first-lego-league/ms-correlation': {
    getCorrelationId () {
      return CORRELATION_ID
    }
  }
})

describe('Logger', () => {
  it('has a default level of DEBUG', () => {
    expect(new Logger().logLevel).to.equal(LOG_LEVELS.DEBUG)
  })

  it('sets the log level if its valid', () => {
    const logger = new Logger()
    logger.logLevel = LOG_LEVELS.INFO
    expect(logger.logLevel).to.equal(LOG_LEVELS.INFO)
  })

  it('throws an error if the log level is not one of the allowed log levels', () => {
    const logger = new Logger()
    expect(() => { logger.logLevel = -5 }).to.throw()
  })

  describe('log', () => {
    const sandbox = chai.spy.sandbox()
    let clock

    beforeEach(() => {
      sandbox.on(console, ['log'])
      clock = sinon.useFakeTimers(MOCK_DATE)
    })

    afterEach(() => {
      sandbox.restore()
      clock.restore()
    })

    it('does not log if the level is lower then the logger\'s level', () => {
      const logger = new Logger()
      logger.logLevel = LOG_LEVELS.WARN
      logger.log(LOG_LEVELS.INFO, 'Some Log')
      expect(console.log).to.not.have.been.called()
    })

    it('logs if the level is equal to the logger\'s level', () => {
      const logger = new Logger()
      logger.logLevel = LOG_LEVELS.WARN
      logger.log(LOG_LEVELS.WARN, 'Some Log')
      expect(console.log).to.have.been.called.once
    })

    it('logs if the level is higher then the logger\'s level', () => {
      const logger = new Logger()
      logger.logLevel = LOG_LEVELS.WARN
      logger.log(LOG_LEVELS.FATAL, 'Some Log')
      expect(console.log).to.have.been.called.once
    })

    it('logs the formatter log according the logger\'s value formatting method', () => {
      const logger = new Logger()
      const logJson = {
        'timestamp': new Date(MOCK_DATE).toISOString(),
        'level': LOG_LEVELS.LOG_LEVELS_TRANSLATION[LOG_LEVELS.DEBUG],
        'module': MODULE_NAME,
        'correlationId': CORRELATION_ID,
        'message': 'message'
      }
      const stringifiedFormttedLog = JSON.stringify(logJson)
      logger.log(LOG_LEVELS.DEBUG, 'message')
      expect(console.log).to.have.been.called.with(stringifiedFormttedLog)
    })
  })

  it('debug calls the logging function with debug level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = chai.spy(() => { })
    logger.debug(message)
    expect(logger.log).to.have.been.called.with(LOG_LEVELS.DEBUG, message)
  })

  it('info calls the logging function with info level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = chai.spy(() => { })
    logger.info(message)
    expect(logger.log).to.have.been.called.with(LOG_LEVELS.INFO, message)
  })

  it('warn calls the logging function with warn level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = chai.spy(() => { })
    logger.warn(message)
    expect(logger.log).to.have.been.called.with(LOG_LEVELS.WARN, message)
  })

  it('error calls the logging function with error level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = chai.spy(() => { })
    logger.error(message)
    expect(logger.log).to.have.been.called.with(LOG_LEVELS.ERROR, message)
  })

  it('fatal calls the logging function with fatal level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = chai.spy(() => { })
    logger.fatal(message)
    expect(logger.log).to.have.been.called.with(LOG_LEVELS.FATAL, message)
  })
})
