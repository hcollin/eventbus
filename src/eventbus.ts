import { EventBusOptions, EventBus, EventBusImplementation, EventBusStats } from "./types/eventBus.types";
import { LOGLEVEL } from "./types/LogLevels.enum";

import { debug, error, info, setLogLevel } from "./utils/logger";

import { createBrowserBus } from "./implementations/browserEventBus";
import { createInternalEventBus } from "./implementations/internalEventBus";

/**
 * Create an event bus object for sending and receiving events
 *
 * There can be multiple implementations of the event bus
 *
 * @param options
 * @returns
 */
export function createEventBus(eventBusOptions?: Partial<EventBusOptions>): EventBus {
    info("Creating eventBus");

    // Default Options
    const options: EventBusOptions = Object.assign(
        {
            type: "BROWSER",
            logLevel: LOGLEVEL.ERROR,
        },
        eventBusOptions
    );

    debug("Options: ", options);

    // Set logging level
    setLogLevel(options.logLevel);

    debug("Log level set to: ", options.logLevel);

    const busImplementation = getEventBusImplementation(options);


    const eventBusStatistics: EventBusStats = {
        sends: 0,
        asks: 0,
        broadcasts: 0,
        on: 0,
        type: options.type,
        logLevel: options.logLevel,
    }

    function stats() {
        return eventBusStatistics;
    }

    function on(key: string, callback: any) {
        eventBusStatistics.on++;
        const removeOn = busImplementation.on(key, callback);
        return () => {
            const removed = removeOn();
            if(removed) {
                eventBusStatistics.on--;
            }
            
        }
    }

    function send(key: string, data: any) {
        eventBusStatistics.sends++;
        busImplementation.send(key, data);
    }

    function ask(key: string, data: any) {
        eventBusStatistics.asks++;
        return busImplementation.ask(key, data);
    }

    function broadcast(data: any) {
        eventBusStatistics.broadcasts++;
        busImplementation.broadcast(data);
    }

    function clear() {
        busImplementation.clear();
    }

    return {
        on,
        send,
        ask,
        broadcast,
        clear,
        stats,
    };
}

function getEventBusImplementation(options: EventBusOptions): EventBusImplementation {
    if (options.type === "INTERNAL") {
        return createInternalEventBus(options);
    }
    if (options.type === "BROWSER") {
        return createBrowserBus(options);
    }
    error(`Unknown eventBus type: ${options.type}. Currently supported types are: INTERNAL & BROWSER`);
    throw new Error(`Unknown eventBus type: ${options.type}`);
}
