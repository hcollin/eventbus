import { EventBusOptions } from "../types/eventBus.types";

export interface BrowserEventBusOptions extends EventBusOptions {
    /**
     * The element this event bus is attached to.
     *
     * Default: document.body
     */
    targetElement: HTMLElement;
}

