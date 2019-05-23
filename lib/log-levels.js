exports.DEBUG = 0
exports.INFO = 1
exports.WARN = 2
exports.ERROR = 3
exports.FATAL = 4

exports.PERMITTED_LOG_LEVELS = [
  exports.DEBUG,
  exports.INFO,
  exports.WARN,
  exports.ERROR,
  exports.FATAL
]

exports.LOG_LEVELS_TRANSLATION = [
  'debug',
  'info ',
  'warn ',
  'error',
  'fatal'
]
