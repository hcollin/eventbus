import { Callback, EventBusOptions } from "../types/eventBus.types";

export interface InternalEventBusOptions extends EventBusOptions {
    
}


export interface InternalEventObserver {
    key: string;
    uid: string;
    callback: Callback;
}