import { LOGLEVEL } from "./LogLevels.enum";


export type Callback = (data: any, eventKey?: string) => any;

export interface EventBusImplementation {
    on(key: string, callback: Callback): () => boolean|void;
    send(key: string, data: any): void;
    ask(key: string, data: any): Promise<any>;
    broadcast(data: any): void;
    clear(): void;
}

export interface EventBus extends EventBusImplementation {
    on(key: string, callback: Callback): () => void;
    stats(): EventBusStats;
}


export interface EventBusStats {
    sends: number;
    asks: number;
    broadcasts: number;
    on: number;
    type: string;
    logLevel: LOGLEVEL;
}


export interface EventBusOptions {
    /**
     * Set the type of event bus to use
     *
     * Default: "BROWSER"
     */
    type: "BROWSER" | "INTERNAL"; 

    /**
     * The logging level for the event bus
     *
     * Valid values are: DEBUG, INFO, WARN, ERROR
     *
     * Default: ERROR
     */
    logLevel: LOGLEVEL;
}
