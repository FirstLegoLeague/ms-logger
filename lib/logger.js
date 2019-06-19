const path = require('path')
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const logLevels = require('./log-levels')

class Logger {
  constructor () {
    this.moduleName = path.basename(path.resolve())
    this.logLevelNames = logLevels.LOG_LEVEL_NAMES
    this.logLevel = process.env.LOG_LEVEL || logLevels.DEBUG
  }

  get logLevel () {
    return this._logLevel
  }

  set logLevel (newLogLevel) {
    if (typeof newLogLevel === 'string') {
      const index = this.logLevelNames.indexOf(newLogLevel.toLowerCase())
      if (index === -1) {
        throw new Error('Invalid log level')
      }



      this._logLevel = index
    } else if (Number.isSafeInteger(newLogLevel)) {
      if (newLogLevel < 0 || newLogLevel >= this.logLevelNames.length) {
        throw new Error('Log level not in range')
      }

      this._logLevel = newLogLevel
    } else {
      throw new TypeError('Expected to get string or integer')
    }
  }

  log (level, message) {
    if (level < this._logLevel) {
      return
    }

    const logJson = this._logJson(level, message)
    console.log(JSON.stringify(logJson))
  }

  debug (message) {
    this.log(logLevels.DEBUG, message)
  }

  info (message) {
    this.log(logLevels.INFO, message)
  }

  warn (message) {
    this.log(logLevels.WARN, message)
  }

  error (message) {
    this.log(logLevels.ERROR, message)
  }

  fatal (message) {
    this.log(logLevels.FATAL, message)
  }

  _logJson (level, message) {
    return {
      timestamp: (new Date()).toISOString(),
      level: this.logLevelNames[level],
      module: this.moduleName,
      correlationId: getCorrelationId(),
      message
    }
  }
}

exports.Logger = Logger
