// @vitest-environment happy-dom

import { describe, expect, test } from "vitest";
import { builtinEnvironments } from "vitest/environments";
import { createBrowserBus } from "./browserEventBus";

describe("BrowserEventBus Test Suite", () => {
    test("Happy-Dom is present and working", () => {
        const envs = Object.keys(builtinEnvironments);
        expect(envs).toContain("happy-dom");

        expect(document).toBeDefined();
    });

    test("BrowserEventBus:GENERAL: Only events with same key should trigger", () => {
        const bus = createBrowserBus({});

        bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
        });

        bus.on("test2", () => {
            // This should not be called ever
            expect(true).toBe(false);
        });

        bus.send("test", "JEE");

        // Remove listeners
        bus.clear();

        bus.send("test2", "This should not trigger anything");
    });

    test("BrowserEventBus:GENERAL: All listeners listening to the same key, should all trigger", () => {
        const bus = createBrowserBus({});

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

    test("BrowserEventBus:ON: Observer remove function must return false if it has been removed already", () => {

        const bus = createBrowserBus({});

        const removeMe = bus.on("test", (data: any) => {
            expect(data).toBe("JEE");
        });

        bus.send("test", "JEE");
        
        const removed = removeMe();

        expect(removed).toBe(true);

        const removedAgain = removeMe();

        expect(removedAgain).toBe(false);
    });

    test("BrowserEventBus:GENERAL: Multiple event busses using same target, should respond to each other", () => {
        // Using default body element as target
        const b1 = createBrowserBus({});
        const b2 = createBrowserBus({});

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

    test("BrowserEventBus:ASK: Ask method expects a response from a listener", async () => {
        const bus = createBrowserBus({});

        bus.on("what", (data: any) => {
            expect(data).toBe(1);
            return data + 1;
        });

        const response = await bus.ask("what", 1);
        expect(response).toEqual([2]);

        bus.clear();
    });

    test("BrowserEventBus:ASK: Multiple answers to a single ask", async () => {
        const bus = createBrowserBus({});

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

    test("BrowserEventBus:BROADCAST: Broadcast should send data to all listeners", () => {
        const bus = createBrowserBus({});

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

    test("BrowserEventBus:BROADCAST: Broadcast events should not trigger after observing has been stopped" , () => {

        const bus = createBrowserBus({});

        
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
