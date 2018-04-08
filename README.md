## FIRST Lego League Logger
This npm module is used to write loges in any of the FIRST Lego League Scoring System modules.
The logs are written as described in the modules standard [here](https://github.com/FirstLegoLeagueIL/architecture/blob/master/module-standard/v1.0-SNAPSHOT.md#log-messages).

#### Simple usage
Add the logger module, and give the name of the module that using the logger.

    const logger = require('firstlegoleaguelogger');  
	logger('MODULE_NAME');

use `logger.setLogLevel(LOG_LEVEL)` to set the minimum log level to be printed.
use `logger.LEVELNAME` to write to the log.
The levels are described in the modules standard.
