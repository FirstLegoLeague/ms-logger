const path = require('path')
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const LOG_LEVELS = require('./log-levels')

class Logger {
  constructor () {
    this.moduleName = path.basename(path.resolve())
    this.LOG_LEVELS = LOG_LEVELS
    this.logLevel = this.LOG_LEVELS.LOG_LEVEL_NAMES || LOG_LEVELS.DEBUG
  }

  get logLevel () {
    return this._logLevel
  }

  set logLevel (newLogLevel) {
    if (!this.LOG_LEVELS.PERMITTED_LOG_LEVELS.includes(newLogLevel)) {
      throw new Error('Invalid log level')
    }
    this._logLevel = newLogLevel
  }

  log (level, message) {
    if (level < this._logLevel) {
      return
    }

    const logJson = this._logJson(level, message)
    console.log(JSON.stringify(logJson))
  }

  debug (message) {
    this.log(LOG_LEVELS.DEBUG, message)
  }

  info (message) {
    this.log(LOG_LEVELS.INFO, message)
  }

  warn (message) {
    this.log(LOG_LEVELS.WARN, message)
  }

  error (message) {
    this.log(LOG_LEVELS.ERROR, message)
  }

  fatal (message) {
    this.log(LOG_LEVELS.FATAL, message)
  }

  _logJson (level, message) {
    return {
      timestamp: (new Date()).toISOString(),
      level: LOG_LEVELS.LOG_LEVELS_TRANSLATION[level],
      module: this.moduleName,
      correlationId: getCorrelationId(),
      message
    }
  }
}

exports.Logger = Logger
