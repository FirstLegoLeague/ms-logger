const chai = require('chai')
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
  it('returns a logger even if not called as a constructor', () => {
    expect(Logger() instanceof Logger).to.equal(true)
  })

  it('has a default level of DEBUG', () => {
    expect(Logger().logLevel).to.equal(LOG_LEVELS.DEBUG)
  })

  describe('set log level', () => {
    it('sets the log level if its valid', () => {
      const logger = Logger()
      logger.setLogLevel(LOG_LEVELS.INFO)
      expect(logger.logLevel).to.equal(LOG_LEVELS.INFO)
    })

    it('throws an error if the log level is not one of the allowed log levels', () => {
      const logger = Logger()
      expect(() => logger.setLogLevel(-5)).to.throw()
    })
  })

  describe('log', () => {
    const sandbox = chai.spy.sandbox()
    const originalDateNow = Date.now

    beforeEach(() => {
      sandbox.on(console, ['log'])
      Date.now = () => MOCK_DATE
    })

    afterEach(() => {
      sandbox.restore()
      Date.now = originalDateNow
    })

    it('does not log if the level is lower then the logger\'s level', () => {
      const logger = Logger()
      logger.setLogLevel(LOG_LEVELS.WARN)
      logger.log(LOG_LEVELS.INFO, 'Some Log')
      expect(console.log).to.not.have.been.called()
    })

    it('logs if the level is equal to the logger\'s level', () => {
      const logger = Logger()
      logger.setLogLevel(LOG_LEVELS.WARN)
      logger.log(LOG_LEVELS.WARN, 'Some Log')
      expect(console.log).to.have.been.called.exactly(1)
    })

    it('logs if the level is higher then the logger\'s level', () => {
      const logger = Logger()
      logger.setLogLevel(LOG_LEVELS.WARN)
      logger.log(LOG_LEVELS.FATAL, 'Some Log')
      expect(console.log).to.have.been.called.exactly(1)
    })

    it('logs the formatter log according the logger\'s value formatting method', () => {
      const logger = Logger()
      logger.formatLog = chai.spy(() => { })
      const message = 'MESSAGE'
      logger.log(LOG_LEVELS.DEBUG, message)
      expect(logger.formatLog).to.have.been.called.with(LOG_LEVELS.DEBUG, MODULE_NAME, CORRELATION_ID, new Date(MOCK_DATE), message)
    })

    it('logs to console the stringified output json of the logger\'s formatting method', () => {
      const logger = Logger()
      const formttedLog = { field1: 'some field', fields2: 'some field2' }
      const stringifiedFormttedLog = JSON.stringify(formttedLog)
      logger.formatLog = () => (formttedLog)
      logger.log(LOG_LEVELS.DEBUG, 'message')
      expect(console.log).to.have.been.called.with(stringifiedFormttedLog)
    })
  })

  describe('log formatting', () => {
    it('throws an error if timestamp is not a date', () => {
      const logger = new Logger()
      expect(logger.formatLog).to.throw()
    })

    it('returns a correctly structures object', () => {
      const logger = new Logger()
      const level = LOG_LEVELS.DEBUG
      const timestamp = new Date(MOCK_DATE)
      const message = 'message'

      expect(logger.formatLog(level, MODULE_NAME, CORRELATION_ID, timestamp, message)).to.eql({
        'timestamp': timestamp.toISOString(),
        'level': LOG_LEVELS.LOG_LEVELS_TRANSLATION[level],
        'module': MODULE_NAME,
        'correlationId': CORRELATION_ID,
        'message': 'message'
      })
    })
  })

  describe('debug', () => {
    it('calls the logging function with debug level', () => {
      const logger = new Logger()
      const message = 'message'
      logger.log = chai.spy(() => { })
      logger.debug(message)
      expect(logger.log).to.have.been.called.with(LOG_LEVELS.DEBUG, message)
    })
  })

  describe('info', () => {
    it('calls the logging function with info level', () => {
      const logger = new Logger()
      const message = 'message'
      logger.log = chai.spy(() => { })
      logger.info(message)
      expect(logger.log).to.have.been.called.with(LOG_LEVELS.INFO, message)
    })
  })

  describe('warn', () => {
    it('calls the logging function with warn level', () => {
      const logger = new Logger()
      const message = 'message'
      logger.log = chai.spy(() => { })
      logger.warn(message)
      expect(logger.log).to.have.been.called.with(LOG_LEVELS.WARN, message)
    })
  })

  describe('error', () => {
    it('calls the logging function with error level', () => {
      const logger = new Logger()
      const message = 'message'
      logger.log = chai.spy(() => { })
      logger.error(message)
      expect(logger.log).to.have.been.called.with(LOG_LEVELS.ERROR, message)
    })
  })

  describe('fatal', () => {
    it('calls the logging function with fatal level', () => {
      const logger = new Logger()
      const message = 'message'
      logger.log = chai.spy(() => { })
      logger.fatal(message)
      expect(logger.log).to.have.been.called.with(LOG_LEVELS.FATAL, message)
    })
  })
})
