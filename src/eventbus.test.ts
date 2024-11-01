import { describe, expect, test } from "vitest";
import { createEventBus } from "./eventbus";
import { LOGLEVEL } from "./types/LogLevels.enum";
import { Callback, EventBus, EventBusOptions } from "./main";

describe("EventBus Test Suite", () => {
    
    test("EventBus: Check default state", () => {
        const bus = createEventBus({});

        expect(bus).toBeDefined();

        // Making sure the event bus has all the required methods
        expect(bus.on).toBeDefined();
        expect(bus.send).toBeDefined();
        expect(bus.ask).toBeDefined();
        expect(bus.broadcast).toBeDefined();
        expect(bus.clear).toBeDefined();
        expect(bus.stats).toBeDefined();

        // Making sure the event bus has the correct default type
        expect(bus.stats().type).toBe("BROWSER");

        // Making sure the event bus has the correct stats at the moment
        expect(bus.stats().asks).toBe(0);
        expect(bus.stats().broadcasts).toBe(0);
        expect(bus.stats().on).toBe(0);
        expect(bus.stats().sends).toBe(0);
    });

    test("EventBus: Check that the event bus exports types", () => {
        expect(typeof ({} as EventBus)).toBe("object");  
        expect(typeof ({} as EventBusOptions)).toBe("object");
        
        
        expect(typeof (((_data: any) => {}) as Callback)).toBe("function");

        expect(typeof LOGLEVEL).toBe("object");
        expect(LOGLEVEL.DEBUG).toBe(0);
        expect(LOGLEVEL.INFO).toBe(1);
        expect(LOGLEVEL.WARN).toBe(2);
        expect(LOGLEVEL.ERROR).toBe(3);
    });

    test("EventBus: Check that the event bus only accepts valid types", () => {
        expect(() => {
            createEventBus({
                // @ts-ignore
                type: "INVALID",
            });
        }).toThrowError("Unknown eventBus type: INVALID");

        // BROSWER is a valid type
        const browser = createEventBus({
            type: "BROWSER",
        });
        expect(browser.stats().type).toBe("BROWSER");

        // INTERNAL is a valid type
        const internal = createEventBus({
            type: "INTERNAL",
        });
        expect(internal.stats().type).toBe("INTERNAL");
    });

    test("EventBus: Check that the event bus only accepts valid log levels", () => {
        const defLevel = createEventBus({});
        expect(defLevel.stats().logLevel).toBe(LOGLEVEL.ERROR);

        const debugLevel = createEventBus({
            logLevel: LOGLEVEL.DEBUG,
        });
        expect(debugLevel.stats().logLevel).toBe(LOGLEVEL.DEBUG);

        const infoLevel = createEventBus({
            logLevel: LOGLEVEL.INFO,
        });
        expect(infoLevel.stats().logLevel).toBe(LOGLEVEL.INFO);

        const warnLevel = createEventBus({
            logLevel: LOGLEVEL.WARN,
        });
        expect(warnLevel.stats().logLevel).toBe(LOGLEVEL.WARN);

        const errorLevel = createEventBus({
            logLevel: LOGLEVEL.ERROR,
        });
        expect(errorLevel.stats().logLevel).toBe(LOGLEVEL.ERROR);
    });

    test("EventBus: Check that the event bus stats are updated correctly", () => {

        console.log("Toot");
        const bus = createEventBus({
            type: "BROWSER",
        });

        expect(bus.stats().on).toBe(0);

        const c = bus.on("test", () => {});

        expect(bus.stats().on).toBe(1);

        bus.send("test", {});

        expect(bus.stats().sends).toBe(1);
        expect(bus.stats().asks).toBe(0);
        expect(bus.stats().broadcasts).toBe(0);
        expect(bus.stats().on).toBe(1);

        bus.ask("test", {});

        expect(bus.stats().asks).toBe(1);
        expect(bus.stats().broadcasts).toBe(0);
        expect(bus.stats().on).toBe(1);
        expect(bus.stats().sends).toBe(1);

        bus.broadcast({});
        bus.broadcast({});
        
        expect(bus.stats().broadcasts).toBe(2);
        expect(bus.stats().asks).toBe(1);
        expect(bus.stats().on).toBe(1);
        expect(bus.stats().sends).toBe(1);

        c();
        
        expect(bus.stats().on).toBe(0);

        c();

        expect(bus.stats().on).toBe(0);

    });
});
