[![npm](https://img.shields.io/npm/v/@first-lego-league/ms-logger.svg)](https://www.npmjs.com/package/@first-lego-league/ms-logger)
[![codecov](https://codecov.io/gh/FirstLegoLeague/ms-logger/branch/master/graph/badge.svg)](https://codecov.io/gh/FirstLegoLeague/ms-logger)
[![Build status](https://ci.appveyor.com/api/projects/status/p7n0tdhplvxd59rd/branch/master?svg=true)](https://ci.appveyor.com/project/2roy999/ms-logger/branch/master)
[![GitHub](https://img.shields.io/github/license/FirstLegoLeague/ms-logger.svg)](https://github.com/FirstLegoLeague/ms-logger/blob/master/LICENSE)

[![David Dependency Status](https://david-dm.org/FirstLegoLeague/ms-logger.svg)](https://david-dm.org/FirstLegoLeague/ms-logger)
[![David Dev Dependency Status](https://david-dm.org/FirstLegoLeague/ms-logger/dev-status.svg)](https://david-dm.org/FirstLegoLeague/ms-logger#info=devDependencies)
[![David Peer Dependencies Status](https://david-dm.org/FirstLegoLeague/ms-logger/peer-status.svg)](https://david-dm.org/FirstLegoLeague/ms-logger?type=peer)

## FIRST Lego League Logger
A simple logger object used to write logs according to the _FIRST_ LEGO League TMS [Module Standard](https://github.com/FirstLegoLeagueIL/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#log-messages). The logger was meant to be used by node servers.

### Usage
There are two ways to use the module.

#### Create a logger directly
```javascript
// import the logger
const { Logger } = require('@first-lego-league/ms-logger')

// Create a new instance
const logger = new Logger()

// Use the logger with the direct log method
// Passing to it the level and message
logger.log(logger.LOG_LEVELS.DEBUG, 'some message')
// Or use the level method directly
logger.debug('some message')
```

Available levels are: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`

When you try to write a log, the logger only logs it if the message's level is higher then the log's `logLevel`. You can access the `logLevel` proeperty like this:
```javascript
const { Logger } = require('@first-lego-league/ms-logger')

const logger = new Logger()
logger.logLevel = logger.LOG_LEVELS.WARN
console.log(logger.logLevel) // 2
```

#### Use the node middleware
```javascript
const { loggerMiddleware } = require('@first-lego-league/ms-logger')
const app = require('express')()

app.use(loggerMiddleware)
```

This adds a double functionality:
1. Each HTTP request to pass through this middleware will be logged, together with its method, URL, the time it took, its issuer and its status code.
2. You can now request from the server to log using HTTP POST to the `/log/:level` endpoint:
	`POST http://server/log/debug message="some message"`.
	The server responds with a 201 on success and a 500 on failure.

### Contribution
To contribute to this repository, simply create a PR and set one of the Code Owners to be a reviewer.
Please notice the linting and UT, because they block merge.
Keep the package lightweight and easy to use.
Thank you for contributing!
