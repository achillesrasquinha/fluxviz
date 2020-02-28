import format from "date-fns/format";

import { TypeError } from "./exception";
import { getenv } from "./util/environment";

const loggers = [ ];

class Logger {
    constructor (name, { level = Logger.DEBUG } = { }) {
        if ( typeof name !== 'string' ) {
            throw new TypeError(`Expected string for name, got ${typeof name} instead.`)
        }

        this.name   = name
        this.level  = level

        if ( !this.level ) {
            if ( getenv("ENVIRONMENT") == "development" ) {
                this.level = Logger.ERROR;
            } else {
                this.level = Logger.NOTSET;
            }
        }
    }

    /**
     * @description Get instance of Logger (return registered one if declared).
     *
     * @param {string} name - Name of the logger.
     */
    static get (name, { level = Logger.DEBUG } = { }) {
        if ( !(name in loggers) )
            loggers[name] = new Logger(name, { level })
        return loggers[name]
    }

    debug (message) { this.log(message, Logger.DEBUG) }
    info  (message) { this.log(message, Logger.INFO)  }
    warn  (message) { this.log(message, Logger.WARN)  }
    error (message) { this.log(message, Logger.ERROR) }

    log (message, { level = Logger.DEBUG } = { }) {
        const timestamp   = new Date();

        if ( level.value <= this.level.value ) {
            const timestr = format(timestamp, "HH:mm:ss");
            console.log("%c " + timestr, "color: " + level.color, message)
        }
    }
};

Logger.DEBUG  = { value: 10, color: '#616161', name: 'DEBUG'  }
Logger.INFO   = { value: 20, color: '#2196F3', name: 'INFO'   }
Logger.WARN   = { value: 30, color: '#FFC107', name: 'WARN'   }
Logger.ERROR  = { value: 40, color: '#F44336', name: 'ERROR'  }
Logger.NOTSET = { value:  0,                   name: 'NOTSET' }

export default Logger;