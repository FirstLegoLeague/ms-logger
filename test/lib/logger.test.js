const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const proxyquire = require('proxyquire')
const path = require('path')

const expect = chai.expect
chai.use(sinonChai)

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

function env (environment, callback) {
  const originalEnv = Object.assign({}, process.env)
  try {
    Object.assign(process.env, environment)
    return callback()
  } finally {
    process.env = originalEnv
  }
}

describe('Logger', () => {
  it('has a default level of DEBUG', () => {
    expect(new Logger().logLevel).to.equal(LOG_LEVELS.DEBUG)
  })

  it('has a default level of process.env.LOG_LEVEL', () => {
    env({ LOG_LEVEL: 'info' }, () => {
      expect(new Logger().logLevel).to.equal(LOG_LEVELS.INFO)
    })
  })

  it('sets the log level if its a valid number', () => {
    const logger = new Logger()
    logger.logLevel = 3
    expect(logger.logLevel).to.equal(3)
  })

  it('sets the log level if its a valid string', () => {
    const logger = new Logger()
    logger.logLevel = 'info'
    expect(logger.logLevel).to.equal(LOG_LEVELS.INFO)
  })

  it('throws an error if the log level is not one of the allowed log levels', () => {
    const logger = new Logger()
    expect(() => { logger.logLevel = -5 }).to.throw()
  })

  it('throws an error if the log level unknown', () => {
    const logger = new Logger()
    expect(() => { logger.logLevel = 'unknown' }).to.throw()
  })

  it('throws a type error if the log level is not a integer or a string', () => {
    const logger = new Logger()
    expect(() => { logger.logLevel = ['not a number or string'] }).to.throw(TypeError)
  })

  describe('log', () => {
    let clock

    beforeEach(() => {
      sinon.stub(console, 'log')
      clock = sinon.useFakeTimers(MOCK_DATE)
    })

    afterEach(() => {
      console.log.restore()
      clock.restore()
    })

    it('does not log if the level is lower then the logger\'s level', () => {
      const logger = new Logger()
      logger.logLevel = 4
      logger.log(3, 'Some Log')
      expect(console.log).to.not.have.been.called
    })

    it('logs if the level is equal to the logger\'s level', () => {
      const logger = new Logger()
      logger.logLevel = 4
      logger.log(4, 'Some Log')
      expect(console.log).to.have.been.calledOnce
    })

    it('logs if the level is higher then the logger\'s level', () => {
      const logger = new Logger()
      logger.logLevel = 3
      logger.log(5, 'Some Log')
      expect(console.log).to.have.been.calledOnce
    })

    it('logs the formatter log according the logger\'s value formatting method', () => {
      const logger = new Logger()
      const logLevel = 0
      const logJson = {
        'timestamp': new Date(MOCK_DATE).toISOString(),
        'level': LOG_LEVELS.LOG_LEVEL_NAMES[logLevel],
        'module': MODULE_NAME,
        'correlationId': CORRELATION_ID,
        'message': 'message'
      }
      const stringifiedFormttedLog = JSON.stringify(logJson)
      logger.log(logLevel, 'message')
      expect(console.log).to.have.been.calledWith(stringifiedFormttedLog)
    })
  })

  it('debug calls the logging function with debug level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = sinon.spy()
    logger.debug(message)
    expect(logger.log).to.have.been.calledWith(LOG_LEVELS.DEBUG, message)
  })

  it('info calls the logging function with info level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = sinon.spy(() => { })
    logger.info(message)
    expect(logger.log).to.have.been.calledWith(LOG_LEVELS.INFO, message)
  })

  it('warn calls the logging function with warn level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = sinon.spy(() => { })
    logger.warn(message)
    expect(logger.log).to.have.been.calledWith(LOG_LEVELS.WARN, message)
  })

  it('error calls the logging function with error level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = sinon.spy(() => { })
    logger.error(message)
    expect(logger.log).to.have.been.calledWith(LOG_LEVELS.ERROR, message)
  })

  it('fatal calls the logging function with fatal level', () => {
    const logger = new Logger()
    const message = 'message'
    logger.log = sinon.spy(() => { })
    logger.fatal(message)
    expect(logger.log).to.have.been.calledWith(LOG_LEVELS.FATAL, message)
  })
})
