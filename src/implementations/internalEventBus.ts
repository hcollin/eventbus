import { Callback, EventBusImplementation } from "../types/eventBus.types";
import { LOGLEVEL } from "../types/LogLevels.enum";
import { debug, error, info, warn } from "../utils/logger";
import { InternalEventBusOptions, InternalEventObserver } from "./internalEventBus.types";

export function createInternalEventBus(options: Partial<InternalEventBusOptions>): EventBusImplementation {
    const observers: Map<string, InternalEventObserver[]> = new Map();


    options.logLevel = options.logLevel || LOGLEVEL.ERROR;

    /**
     * Observe for an event
     * 
     * @param key 
     * @param callback 
     * @returns 
     */
    function on(key: string, callback: Callback): () => void {
        info(`On: Registering callback for event: '${key}'`);

        const uid: string = `${key}-${Date.now()}-${Math.random() * 9999999}`;
        const observer: InternalEventObserver = {
            key,
            uid,
            callback,
        };

        if (!observers.has(key)) {
            observers.set(key, [observer]);
        } else {
            const newObservers = observers.get(key);
            if (newObservers) {
                newObservers.push(observer);
                observers.set(key, newObservers);
            } else {
                error(`On: Could not add observer for key: ${key}`);
            }
        }

        debug(`On: Current total observers for key: ${key} is ${observers.get(key)?.length}`);
        debug(`On: Current observer keys: ${observers.size}`);

        return () => {
            const modObservers = observers.get(key);
            if (modObservers) {
                const exists = modObservers.find((o) => o.uid === uid);
                if(!exists) {
                    return false;
                }
                observers.set(
                    key,
                    modObservers.filter((o) => o.uid !== uid)
                );
                if (observers.get(key)?.length === 0) {
                    observers.delete(key);
                }
                return true;
            }
            return false;
        };
    }

    /**
     * Send event for to the EventBus
     * 
     * @param key 
     * @param data 
     */
    function send(key: string, data: any) {
        debug(`Send: Sending event: ${key}`);
        const obsForKey = observers.get(key);
        if (obsForKey && obsForKey.length > 0) {
            obsForKey.forEach((observer) => {
                observer.callback(data, key);
            });
        }
    }

    /**
     * Ask responses from all observers for an event
     * 
     * @param key 
     * @param data 
     * @returns
     * */
    function ask(key: string, data: any) {
        info(`Ask: Asking event: ${key}`);

        return new Promise((resolve, reject) => {
            const responses: any[] = [];

            const obsForKey = observers.get(key);
            try {
                if (obsForKey && obsForKey.length > 0) {
                    obsForKey.forEach((observer) => {
                        const response = observer.callback(data, key);
                        if (response) {
                            responses.push(response);
                        }
                    });

                    resolve(responses);
                } else {
                    warn(`Ask: No observers for key ${key}`);
                }
            } catch (e) {
                error(`Ask: Error occured in observer for key ${key}`, e);
                if(responses.length > 0) {
                    resolve(responses);
                } else {
                    reject(e);
                }
            }

            resolve([]);
        });
    }

    function broadcast(data: any) {
        info("Broadcast: Sending data to all observers");
        observers.forEach((observersForKey) => {
            observersForKey.forEach((observer) => {
                observer.callback(data);
            });
        });
    }

    /**
     * Clear all observers
     */
    function clear() {
        warn(`Clear: Clearing all observers`);
        observers.clear();
    }

    return {
        on,
        send,
        ask,
        clear,
        broadcast
    };
}
