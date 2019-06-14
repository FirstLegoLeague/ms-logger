exports.LOG_LEVEL_NAMES = [
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
]

exports.PERMITTED_LOG_LEVELS = []
exports.LOG_LEVELS_TRANSLATION = []

exports.LOG_LEVEL_NAMES.forEach((level, index) => {
  exports[level.toUpperCase()] = index
  exports.PERMITTED_LOG_LEVELS.push(index)
  exports.LOG_LEVELS_TRANSLATION.push(level)
})
