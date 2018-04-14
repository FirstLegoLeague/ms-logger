## FIRST Lego League Logger
This npm module is used to write loges in any of the FIRST Lego League Scoring System modules.
The logs are written as described in the modules standard [here](https://github.com/FirstLegoLeagueIL/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#log-messages).

#### Simple usage
Add the logger module, and give the name of the module that using the logger.

    const logger_module = require('firstlegoleaguelogger');
	let logger = logger_module('MODULE_NAME');

use `logger.setLogLevel(LOG_LEVEL)` to set the minimum log level to be printed.
use `logger.LEVELNAME` to write to the log.
The levels are described in the modules standard.

### Development
1. Fork this repository
2. make some changes
3. create a Pull Request
4. Wait for a CR from the code owner
5. make sure everything is well
6. merge

A few things to notice while developing:
* Use `yarn` not `npm`
* Follow javascript standard as described [here](https://standardjs.com/)
* Keep the package lightweight and easy to use
* Don't break API if not neccessary
* Be creative and have fun
