const chai = require('chai')
const spies = require('chai-spies')
const proxyquire = require('proxyquire')
const express = require('express')
const request = require('supertest')

const expect = chai.expect
chai.use(spies)

const mockLogger = {
  log: () => { },
  debug: () => mockLogger.log(),
  info: () => mockLogger.log(),
  warn: () => mockLogger.log(),
  error: () => mockLogger.log(),
  fatal: () => mockLogger.log()
}

let MockLogger = () => mockLogger
// Logger must be a constructor
function Logger () {
  return MockLogger.apply(this, arguments)
}

const { middleware } = proxyquire('../../lib/middleware', {
  './logger': {
    Logger
  }
})

describe('middleware', () => {
  const message = 'Some message'
  const sandbox = chai.spy.sandbox()
  let app

  beforeEach(() => {
    sandbox.on(mockLogger, ['log', 'debug', 'info', 'warn', 'error', 'fatal'])
    app = express()
    app.use(middleware)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('endpoint', () => {
    it('only logs a log request once', () => {
      return request(app)
        .post('/log/debug')
        .send({ message })
        .expect(201)
        .then(() => {
          expect(mockLogger.log).to.have.been.called.once
        })
    })

    it('logs with the correct level', () => {
      return request(app)
        .post('/log/warn')
        .send({ message })
        .expect(201)
        .then(() => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
        })
    })

    it('logs with info if the level does not exist', () => {
      return request(app)
        .post('/log/some_level')
        .send({ message })
        .expect(201)
        .then(() => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.have.been.called()
          expect(mockLogger.warn).to.not.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
        })
    })

    it('responds with 500 if the log throws an error', () => {
      const originalInfo = mockLogger.info
      mockLogger.info = () => { throw new Error('some error') }
      return request(app)
        .post('/log/info')
        .send({ message })
        .expect(500)
        .then(() => {
          mockLogger.info = originalInfo
        })
    })
  })

  describe('middleware', () => {
    let status
    let logMessage
    const originalDebug = mockLogger.debug

    beforeEach(() => {
      status = 200
      app.use((req, res) => res.sendStatus(status))
      mockLogger.debug = chai.spy(msg => {
        logMessage = msg
        originalDebug.call(this, arguments)
      })
    })

    afterEach(() => {
      mockLogger.debug = originalDebug
    })

    it('only logs the request once', () => {
      return request(app)
        .post('/some_path')
        .send({ message })
        .expect(status)
        .then(() => {
          expect(mockLogger.log).to.have.been.called.once
        })
    })

    it('logs in debug level if the status is a successful one', () => {
      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(mockLogger.debug).to.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.not.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
        })
    })

    it('logs in warn level if the status is client fault', () => {
      status = 400
      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
        })
    })

    it('logs in error level if the status is server fault', () => {
      status = 500
      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.not.have.been.called()
          expect(mockLogger.error).to.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
        })
    })

    it('only calls Logger creation once', () => {
      const originalMockLogger = MockLogger
      MockLogger = chai.spy(MockLogger)
      app = express()
      app.use((req, res, next) => {
        req.logger = mockLogger
        next()
      })
      app.use(middleware)
      app.use((req, res) => res.sendStatus(status))

      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(MockLogger).to.not.have.been.called()
          MockLogger = originalMockLogger
        })
    })

    it('log message contains the request method in captial letters when the method is get', () => {
      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(logMessage.includes('GET')).to.equal(true)
        })
    })

    it('log message contains the request method in captial letters when the method is post', () => {
      return request(app)
        .post('/some_path')
        .expect(status)
        .then(() => {
          expect(logMessage.includes('POST')).to.equal(true)
        })
    })

    it('log message contains the request path', () => {
      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(logMessage.includes('/some_path')).to.equal(true)
        })
    })

    it('log message contains the request status code', () => {
      return request(app)
        .get('/some_path')
        .expect(status)
        .then(() => {
          expect(logMessage.includes(status)).to.equal(true)
        })
    })
  })
})
