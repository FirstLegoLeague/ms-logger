'use strict'

const LOG_LEVELS = require('./log_levels')

function Logger (moduleName) {
  if (!(this instanceof Logger)) {
    return new Logger(moduleName)
  }

  this.moduleName = moduleName
  this.LOG_LEVELS = LOG_LEVELS
  this.setLogLevel(LOG_LEVELS.DEBUG)
}

Logger.prototype.setLogLevel = function (logLevel) {
  this.logLevel = logLevel
}

Logger.prototype.log = function (level, correlationId, message) {
  if (level < this.logLevel) {
    return
  }

  const formattedLog = this.formatLog(level, this.moduleName, new Date(Date.now()), correlationId, message)
  console.log(JSON.stringify(formattedLog) + '\n')
}

Logger.prototype.formatLog = function (level, moduleName, timestamp, correlationId, message) {
  if (!(timestamp instanceof Date)) {
    throw new Error('timestamp must be a date')
  }

  return {
    'level': LOG_LEVELS.LOG_LEVELS_TRANSLATION[level],
    'module': moduleName,
    'timestamp': timestamp.toISOString(),
    'correlationId': correlationId,
    'message': message
  }
}

Logger.prototype.debug = function (correlationId, message) {
  this.log(LOG_LEVELS.DEBUG, correlationId, message)
}

Logger.prototype.info = function (correlationId, message) {
  this.log(LOG_LEVELS.INFO, correlationId, message)
}

Logger.prototype.error = function (correlationId, message) {
  this.log(LOG_LEVELS.ERROR, correlationId, message)
}

Logger.prototype.warn = function (correlationId, message) {
  this.log(LOG_LEVELS.WARN, correlationId, message)
}

Logger.prototype.fatal = function (correlationId, message) {
  this.log(LOG_LEVELS.FATAL, correlationId, message)
}

module.exports = Logger
