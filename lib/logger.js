'use strict'

const path = require('path')
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const LOG_LEVELS = require('./log-levels')

function Logger () {
  if (!(this instanceof Logger)) {
    return new Logger()
  }

  // As a rule of thumb, launcher would run the process in
  // the module directory which is in the name of the module
  this.moduleName = path.basename(path.resolve())

  this.LOG_LEVELS = LOG_LEVELS
  this.setLogLevel(process.env.LOG_LEVEL || LOG_LEVELS.DEBUG)
}

Logger.prototype.setLogLevel = function (logLevel) {
  this.logLevel = logLevel
}

Logger.prototype.log = function (level, message) {
  if (level < this.logLevel) {
    return
  }

  const formattedLog = this.formatLog(level, this.moduleName, getCorrelationId(), new Date(Date.now()), message)
  console.log(JSON.stringify(formattedLog))
}

Logger.prototype.formatLog = function (level, moduleName, correlationId, timestamp, message) {
  if (!(timestamp instanceof Date)) {
    throw new Error('timestamp must be a date')
  }

  return {
    'timestamp': timestamp.toISOString(),
    'level': LOG_LEVELS.LOG_LEVELS_TRANSLATION[level],
    'module': moduleName,
    'correlationId': correlationId,
    'message': message
  }
}

Logger.prototype.debug = function (message) {
  this.log(LOG_LEVELS.DEBUG, message)
}

Logger.prototype.info = function (message) {
  this.log(LOG_LEVELS.INFO, message)
}

Logger.prototype.error = function (message) {
  this.log(LOG_LEVELS.ERROR, message)
}

Logger.prototype.warn = function (message) {
  this.log(LOG_LEVELS.WARN, message)
}

Logger.prototype.fatal = function (message) {
  this.log(LOG_LEVELS.FATAL, message)
}

exports.Logger = Logger
