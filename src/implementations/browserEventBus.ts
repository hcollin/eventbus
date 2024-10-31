import { Callback, EventBusImplementation } from "../types/eventBus.types";
import { BrowserEventBusOptions } from "./browserEventBus.types";

import { info, error, debug } from "../utils/logger";

/**
 * Create an event bus object for sending and receiving events via browsers event system
 * @param options
 * @returns
 */
export function createBrowserBus(options: Partial<BrowserEventBusOptions>): EventBusImplementation {
    info("Creating browser event bus");

    if (!document) {
        error("No document object available for browser event bus");
        throw new Error("No document object available for browser event bus");
    }

    const targetElement = options.targetElement || document.body;

    if (!targetElement) {
        error("No target element provided for browser event bus");
        throw new Error("No target element provided for browser event bus");
    }

    let observers: { id: string; key: string; callback: (data: any) => void; remove: () => void }[] = [];

    /**
     * busEventKey generator
     *
     * @param key
     * @returns
     */
    function busKey(key: string): string {
        return `eventbus:${key}`;
    }

    function broadcastKey(): string {
        return `eventbus:broadcast:global`;
    }

    /**
     * Register a callback for an event
     *
     * If the callback returns a value, it will be sent back to the sender as a response or to the next event in the queue depending on the event type
     *
     * @param key
     * @param callback
     * @returns
     */
    function on(key: string, callback: Callback) {
        info(`On: Registering callback for event: '${key}'`);
        
        const uid: string = `${key}-${Date.now()}-${Math.random() * 9999999}`;

        function cb(e: Event) {
            if (e instanceof CustomEvent) {
                // If the event has a response key, we should send the return value of the callback back as another event
                if (e.detail._eventBusResponseKey) {
                    debug(`On:Callback handler: Ask event with ${key}`);
                    const response = callback(e.detail.data, e.type);
                    if (response !== undefined) {
                        debug(
                            `On:Callback handler: Sending response for event: ${key} as ${e.detail._eventBusResponseKey}`
                        );
                        send(e.detail._eventBusResponseKey, response);
                    }
                    return;
                }

                // Standard response to event
                debug(`On:Callback handler: Event with key ${key}`);
                callback(e.detail, e.type);
            } else {
                error(`On: Callback handler: Invalid event type: ${e.type}`);

                throw new Error(`Invalid event type: ${e.type}`);
            }
        }

        function cbbroadcast(e: Event) {
            if (e instanceof CustomEvent) {
                debug(`On:Callback handler: Broadcast event`);

                callback(e.detail.data);
            } else {
                error(`On: Callback handler: Invalid event type: ${e.type}`);

                throw new Error(`Invalid event type: ${e.type}`);
            }
        }

        targetElement.addEventListener(busKey(key), cb);
        targetElement.addEventListener(broadcastKey(), cbbroadcast);

        function remove() {
            info(`Removing callback for event: ${key}`);

            // Check if already removed drom lexists list
            const lexists = observers.filter((l) => l.id === uid);
        
            if(lexists.length === 0) {
                return false;
            }

            targetElement.removeEventListener(busKey(key), cb);
            targetElement.removeEventListener(broadcastKey(), cbbroadcast);

            
            observers = observers.filter((l) => l.id !== uid);
            return true;
        }

        observers.push({ id: uid, key, callback, remove });

        return remove;
    }

    /**
     * Send a simple event to the event bus
     *
     * This is a fire and forget styled event, that expects no response and has no idea if anyone is listening
     *
     * @param key
     * @param data
     */
    function send(key: string, data?: any) {
        debug(`Sending event: ${key}`);
        const event = data ? new CustomEvent(busKey(key), { detail: data }) : new CustomEvent(busKey(key));
        targetElement.dispatchEvent(event);
    }

    /**
     * Two way communication with the event bus
     *
     * This request expects a response from a listener and automatically times out after one second
     *
     * The response is an array of all responses recieved
     *
     * @param string - key
     * @param any - data
     * @returns Promise<any[]> - Array of responses
     */
    function ask(key: string, data?: any): Promise<any> {
        info(`Ask: Event with key '${key}'`);
        return new Promise((resolve, reject) => {
            const responseKey = `response:${key}-${Date.now()}-${Math.random() * 99999999}`;

            const askDetail = {
                data: data || null,
                _eventBusResponseKey: responseKey,
            };

            let done = false;

            const responses: any[] = [];

            setTimeout(() => {
                if (!done) {
                    error(`Timeout for event: ${key} with ${responses.length} responses`);
                    reject(`Timeout for event: ${key}`);
                }
            }, 1000);

            function responseHandler(e: Event) {
                if (e instanceof CustomEvent) {
                    responses.push(e.detail);
                    debug(`Ask: Response no. ${responses.length} recieved for event: ${key}`);
                    // resolve(e.detail);
                } else {
                    error("Response was not a CustomEvent");
                }
            }

            targetElement.addEventListener(busKey(responseKey), responseHandler);

            const event = new CustomEvent(busKey(key), { detail: askDetail });
            targetElement.dispatchEvent(event);

            info(`Ask: All responses recieved for event: ${key}. Total responses: ${responses.length}`);
            done = true;
            targetElement.removeEventListener(busKey(responseKey), responseHandler);
            resolve(responses);
        });
    }

    function broadcast(data: any) {
        targetElement.dispatchEvent(new CustomEvent(broadcastKey(), { detail: { data } }));
    }

    /**
     * Clear all listeners from the event bus
     *
     * This is useful mainly for testing
     */
    function clear() {
        observers.forEach((l) => {
            l.remove();
        });
        observers = [];
    }

    return {
        on,
        send,
        ask,
        broadcast,
        clear,
    };
}
