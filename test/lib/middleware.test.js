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

function Logger () {
  return mockLogger
}

const { middleware } = proxyquire('../../lib/middleware', {
  './logger': {
    Logger
  }
})

const app = express()
app.use(middleware)

describe('middleware', () => {
  const message = 'Some message'
  const sandbox = chai.spy.sandbox()

  beforeEach(() => {
    sandbox.on(mockLogger, ['log', 'debug', 'info', 'warn', 'error', 'fatal'])
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('only logs a log request once', done => {
    request(app)
      .post('/log/debug')
      .send({ message })
      .expect(201, () => {
        expect(mockLogger.log).to.have.been.called.exactly(1)
        done()
      })
  })
})
