import { createEventBus } from "./eventbus.ts";
import { LOGLEVEL } from "./types/LogLevels.enum.ts";

const bus = createEventBus({
    logLevel: LOGLEVEL.DEBUG,
});

bus.on("test", (data: any) => {
    console.log(data);
});

bus.on("testmore", (data: any) => {
    console.log(data);
});

const cancel3 = bus.on("test", (data: any) => {
    console.log("Something fishy!", data);
});

let i = 0;

const stop = setInterval(() => {
    bus.send("test", `TEST ${++i}`);
}, 2000);

const stop2 = setInterval(() => {
    bus.send("testmore", "JOOO");
}, 3000);

setTimeout(() => {
    cancel3();
}, 5500);

setTimeout(() => {
    clearInterval(stop);
    clearInterval(stop2);
}, 10000);
