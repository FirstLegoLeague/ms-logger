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
    it('only logs a log request once', done => {
      request(app)
        .post('/log/debug')
        .send({ message })
        .expect(201, () => {
          expect(mockLogger.log).to.have.been.called.exactly(1)
          done()
        })
    })

    it('logs with the correct level', done => {
      request(app)
        .post('/log/warn')
        .send({ message })
        .expect(201, () => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
          done()
        })
    })

    it('logs with info if the level does not exist', done => {
      request(app)
        .post('/log/some_level')
        .send({ message })
        .expect(201, () => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.have.been.called()
          expect(mockLogger.warn).to.not.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
          done()
        })
    })

    it('responds with 500 if the log throws an error', done => {
      const originalInfo = mockLogger.info
      mockLogger.info = () => { throw new Error('some error') }
      request(app)
        .post('/log/info')
        .send({ message })
        .expect(500, () => {
          mockLogger.info = originalInfo
          done()
        })
    })
  })

  describe('middleware', () => {
    let status
    beforeEach(() => {
      status = 200
      app.use((req, res) => res.sendStatus(status))
    })

    it('only logs the request once', done => {
      request(app)
        .post('/some_path')
        .send({ message })
        .expect(status, () => {
          expect(mockLogger.log).to.have.been.called.exactly(1)
          done()
        })
    })

    it('logs in debug level if the status is a successful one', done => {
      request(app)
        .get('/some_path')
        .expect(status, () => {
          expect(mockLogger.debug).to.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.not.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
          done()
        })
    })

    it('logs in warn level if the status is client fault', done => {
      status = 400
      request(app)
        .get('/some_path')
        .expect(status, () => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.have.been.called()
          expect(mockLogger.error).to.not.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
          done()
        })
    })

    it('logs in error level if the status is server fault', done => {
      status = 500
      request(app)
        .get('/some_path')
        .expect(status, () => {
          expect(mockLogger.debug).to.not.have.been.called()
          expect(mockLogger.info).to.not.have.been.called()
          expect(mockLogger.warn).to.not.have.been.called()
          expect(mockLogger.error).to.have.been.called()
          expect(mockLogger.fatal).to.not.have.been.called()
          done()
        })
    })

    it('only calls Logger creation once', done => {
      const originalMockLogger = MockLogger
      MockLogger = chai.spy(MockLogger)
      app = express()
      app.use((req, res, next) => {
        req.logger = mockLogger
        next()
      })
      app.use(middleware)
      app.use((req, res) => res.sendStatus(status))

      request(app)
        .get('/some_path')
        .expect(status, () => {
          expect(MockLogger).to.not.have.been.called()
          MockLogger = originalMockLogger
          done()
        })
    })

    describe('log message', () => {
      let logMessage
      const originalDebug = mockLogger.debug
      beforeEach(() => {
        mockLogger.debug = msg => { logMessage = msg }
      })

      afterEach(() => {
        mockLogger.debug = originalDebug
      })

      it('contains the request method in captial letters when the method is get', done => {
        request(app)
          .get('/some_path')
          .expect(status, () => {
            expect(logMessage.includes('GET')).to.equal(true)
            done()
          })
      })

      it('contains the request method in captial letters when the method is post', done => {
        request(app)
          .post('/some_path')
          .expect(status, () => {
            expect(logMessage.includes('POST')).to.equal(true)
            done()
          })
      })

      it('contains the request path', done => {
        request(app)
          .get('/some_path')
          .expect(status, () => {
            expect(logMessage.includes('/some_path')).to.equal(true)
            done()
          })
      })

      it('contains the request status code', done => {
        request(app)
          .get('/some_path')
          .expect(status, () => {
            expect(logMessage.includes(status)).to.equal(true)
            done()
          })
      })
    })
  })
})
