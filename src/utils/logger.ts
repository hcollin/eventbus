import { LOGLEVEL } from "../types/LogLevels.enum";
import { timeStamp } from "./genericUtils";


let CURRENTLOGLEVEL = LOGLEVEL.ERROR;

export function setLogLevel(level: LOGLEVEL) {
    CURRENTLOGLEVEL = level;
}

export function log(msg: string, level: LOGLEVEL, args?: any[]) {
    if(console === undefined || console.log === undefined) {
        throw new Error("No console available");
    }
    if (level >= CURRENTLOGLEVEL) {
        if(args && args.length > 0) {
            console.log(`${timeStamp()}:[${LOGLEVEL[level]}]: ${msg}`, args);
        } else {
            console.log(`${timeStamp()}:[${LOGLEVEL[level]}]: ${msg}`);
        }
        
    }
}

export function debug(msg: string, ...args: any[]) {
    log(msg, LOGLEVEL.DEBUG, args);
}

export function info(msg: string, ...args: any[]) {
    log(msg, LOGLEVEL.INFO, args);
}

export function warn(msg: string, ...args: any[]) {
    log(msg, LOGLEVEL.WARN, args);
}

export function error(msg: string, ...args: any[]) {
    log(msg, LOGLEVEL.ERROR, args);
}
