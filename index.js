const logLevels = require('logLevels');

function Logger(moduleName) {

    if (!(this instanceof Logger)) {
        return new Logger(moduleName);
    }

    this.moduleName = moduleName;
    this.setLogLevel(logLevels.DEBUG);
}

Logger.prototype.setLogLevel = function (logLevel) {
    this.logLevel = logLevel;
};

Logger.prototype.writeLog = function (level, correlationId, message) {
    if (level < this.logLevel) {
        return;
    }

    let formattedLog = this.formatLog(level, this.moduleName, Date.now(), correlationId, message);
    console.log(JSON.stringify(formattedLog) + '\n');
};

Logger.prototype.formatLog = function (level, moduleName, timestamp, correlationId, message) {

    if (!(timestamp instanceof Date)) {
        throw "timestamp must be a date";
    }

    return {
        "level": level,
        "module": moduleName,
        "timestamp": timestamp.toISOString(),
        "correlationId": correlationId,
        "message": message
    }
};

Logger.prototype.debug = function (correlationId, message) {
    this.writeLog(logLevels.DEBUG, correlationId, message);
};

Logger.prototype.info = function (correlationId, message) {
    this.writeLog(logLevels.INFO, correlationId, message);
};

Logger.prototype.error = function (correlationId, message) {
    this.writeLog(logLevels.ERROR, correlationId, message);
};

Logger.prototype.warn = function (correlationId, message) {
    this.writeLog(logLevels.WARN, correlationId, message)
};

Logger.prototype.fatal = function (correlationId, message) {
    this.writeLog(logLevels.FATAL, correlationId, message);
};

Logger.logLevels = logLevels;

export default Logger;