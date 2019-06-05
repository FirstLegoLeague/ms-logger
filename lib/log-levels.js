exports.LOG_LEVEL_NAMES = [
  'debug',
  'info',
  'warn',
  'error',
  'fatal'
]

exports.PERMITTED_LOG_LEVELS = []
exports.LOG_LEVELS_TRANSLATION = []

const maximumLevelLength = exports.LOG_LEVEL_NAMES.reduce((max, level) => Math.max(level.length, max), 0)
function addSpacesToMatchLength (str, length) {
  return str + Array(length + 1 - str.length).join(' ')
}

exports.LOG_LEVEL_NAMES.forEach((level, index) => {
  exports[level.toUpperCase()] = index
  exports.PERMITTED_LOG_LEVELS.push(index)
  exports.LOG_LEVELS_TRANSLATION.push(addSpacesToMatchLength(level, maximumLevelLength))
})
