# Event Bus

This simple library/code can be used to transfer messages in browser between different frameworks. It uses the browserers EventTarget (https://developer.mozilla.org/en-US/docs/Web/API/EventTarget) functions addEventListener, dispatchEvent and removeEventListener. Alternatively in can also use built-in observer Map.

Notice! All **events are synchronous**, as the EventTarget is synchronous in itself.

## Installing

TODO: Currently there is no packaged version of this library yet.

## Simple Usage

Below is a simple example of the usage, where the bus is sending data

```ts
const bus = createEventBus({ ...options });

const removeMe = bus.on("myEventKey", (data: any) => {
    // Do something with the data sent to event key "meEventKey"
});

// Sends the string foo to all observers listening to key "myEventKey"
bus.send("myEventKey", "FOO");

// Remove the observer
removeMe();
```

## Options

EventBus takes two options

```ts
interface EventBusOptions {
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
     * The enum is representation of number 0 to 3.
     *
     * Default: ERROR
     */
    logLevel: LOGLEVEL;
}
```

### untested _targetElement_ option

The event bus type **BROWSER** also accepts options _targetElement_ that accepts an HTML node. This defaults to current document.body element.

This op

## Instance independency

When using the **BROWSER** type allows sending events between different EventBus instances.

Example:

```ts
const bus1 = createEventBus({ type: "BROWSER" });
const bus2 = createEventBus({ type: "BROWSER" });
const bus3 = createEventBus({ type: "INTERNAL" });

bus1.on("test", (data: any) => {
    // Do stuff
});

bus2.on("test", (data: any) => {
    // Do stuff
});

bus3.on("test", (data: any) => {
    // Do stuff
});

// This event will be recieved in both bus1 and bus2, but not bus3
bus1.send("test", "Foo");

// This event is only recieved by bus3 as it is internal eventBus not utilizing DOM EventTarget
bus3.send("test", "Bar");
```

# API

The Event Bus provides the following API

## on()

Attach an observer to the provided event key.

Example of **on()** that listens to any data sent to event key "mykey". The return value of the observer can be accessed by triggering party with function **ask()**.

```ts
const remove = bus.on("mykey", (data: any) => {
    // Do something

    // Can optionally return a value too.
    return "This is fine!";
});

// Stop listening
remove();
```

## send()

Send an event with attached optional payload to all observer listening to the provided event key.

Example sends a payload "foo" to all observers listening to event key "mykey".

```ts
bus.on("mykey", (data: any) => {
    // Will recieve the event with payload "Foo"
});

bus.on("anotherkey", (data: any) => {
    // Will NOT recieve the event
});

bus.send("mykey", "Foo");
```

## broadcast()

Send event with payload all listeners no matter the eventkey they are listening

Example send payload "Foo" to all observers.

```ts
bus.on("mykey", (data: any) => {
    // Will recieve the event with payload "Foo"
});

bus.on("anotherkey", (data: any) => {
    // Will recieve the event with payload "Foo"
});

bus.broadcast("Foo");
```

## ask()

Send a payload to eventkey and collect their return values to an array.

**_Notice!_** _This is asynchronous function as we need to be able to wait for the response events from all observers._

Example:

```ts
bus.on("eventA", (data: any) => {
    return "Bar";
});

bus.on("eventA", (data: any) => {
    if (typeof data === "string") {
        return data + " x2";
    }
});

// This is wrapped into a promise as must wait for
const results = await bus.ask("eventA", "Foo"); // returns ["Bar", "Foo x2"]
```

## clear()

Removes all observers attached to this EventBus instance

```ts
const bus = createEventBus({});

bus.clear();
```

## stats()

Returns some stats and config information from the current EventBus instance

```ts
const bus = createEventBus([]);
bus.stats();
```
