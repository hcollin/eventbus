import { describe, expect, test } from "vitest";
import { createInternalEventBus } from "./internalEventBus";

describe("InternalEventBus Test Suite", () => {
    test("InternalEventBus:GENERAL: Only events with same key should trigger", () => {
        const bus = createInternalEventBus({});

        bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
        });

        bus.on("test2", () => {
            // This should not be called ever
            expect(true).toBe(false);
        });

        bus.send("test", "JEE");
    });

    test("InternalEventBus:GENERAL: All listeners listening to the same key, should all trigger", () => {
        const bus = createInternalEventBus({});

        let i = 0;
        bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
            i++;
        });

        bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
            i++;
        });

        bus.send("test", "JEE");

        expect(i).toBe(2);

        bus.clear();
    });

    
    test.only("InternalEventBus:ON: Observer remove function must return false if it has been removed already", () => {

        const bus = createInternalEventBus({});

        const removeMe = bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
        });

        bus.send("test", "JEE");
        
        const removed = removeMe();

        expect(removed).toBe(true);

        const removedAgain = removeMe();

        expect(removedAgain).toBe(false);
    });

    test("InternalEventBus:GENERAL: Multiple event busses using same target, should respond to each other", () => {
        // Using default body element as target
        const b1 = createInternalEventBus({});
        const b2 = createInternalEventBus({});

        b1.on("test", (data: any) => {
            expect(data).toBe("JEE");
        });

        b2.on("test", (data: any) => {
            expect(data).toBe("JEE");
        });

        b2.send("test", "JEE");

        b1.clear();
        b2.clear();
    });

    test("InternalEventBus:ASK: Ask method expects a response from a listener", async () => {
        const bus = createInternalEventBus({});

        bus.on("what", (data: any) => {
            expect(data).toBe(1);
            return data + 1;
        });

        const response = await bus.ask("what", 1);
        expect(response).toEqual([2]);

        bus.clear();
    });

    test("InternalEventBus:ASK: Multiple answers to a single ask", async () => {
        const bus = createInternalEventBus({});

        let i = 0;

        bus.on("test", () => {
            expect(true).toBe(false);
        });

        bus.on("srv", (data: any) => {
            expect(data).toBe(1);
            i++;
            return data + 1;
        });

        bus.on("srv", (data: any) => {
            expect(data).toBe(1);
            i++;
            return data + 2;
        });

        const response = await bus.ask("srv", 1);
        expect(response).toEqual([2, 3]);

        bus.clear();
    });


    test("InternalEventBus:BROADCAST: Broadcast should send data to all listeners", () => {

        const bus = createInternalEventBus({});

        let i = 0;

        bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
            i++;
        });

        bus.on("test2", (data: any) => {
            expect(data).toBe("JEE");
            i++;
        });

        bus.broadcast("JEE");

        expect(i).toBe(2);

        bus.clear();
    });

    test("InternalEventBus:BROADCAST: Broadcast events should not trigger after observing has been stopped" , () => {

        const bus = createInternalEventBus({});

        
        let i = 0;

        const clearOne = bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
            i++;
        });

        bus.on("test2", (data: any) => {
            expect(data).toBe("JEE");
            i++;
        });

        bus.broadcast("JEE");

        expect(i).toBe(2);

        clearOne();

        bus.broadcast("JEE");

        expect(i).toBe(3);

    });

});
