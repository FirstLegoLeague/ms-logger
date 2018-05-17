'use strict'

const path = require('path')
const Yaml = require('yamljs')
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const LOG_LEVELS = require('./log-levels')

function Logger () {
  if (!(this instanceof Logger)) {
    return new Logger()
  }

  const module = Yaml.load(path.resolve('module.yml'))

  this.moduleName = module.name
  this.LOG_LEVELS = LOG_LEVELS
  this.setLogLevel(LOG_LEVELS.DEBUG)
}

Logger.prototype.setLogLevel = function (logLevel) {
  this.logLevel = logLevel
}

Logger.prototype.log = function (level, message) {
  if (level < this.logLevel) {
    return
  }

  const formattedLog = this.formatLog(level, this.moduleName, getCorrelationId(), new Date(Date.now()), message)
  console.log(JSON.stringify(formattedLog) + '\n')
}

Logger.prototype.formatLog = function (level, moduleName, correlationId, timestamp, message) {
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
