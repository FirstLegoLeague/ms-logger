const chai = require('chai')
const proxyquire = require('proxyquire')

const expect = chai.expect

const { Logger } = proxyquire('../../lib/logger', {
  '@first-lego-league/ms-correlation': { }
})

describe('Logger', () => {
  it('returns a logger even if not called as a constructor', () => {
    expect(Logger() instanceof Logger).to.equal(true)
  })
})
