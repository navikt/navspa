export function createCustomEvent<T>(type: string, detail: T): Event {
    try {
        return new CustomEvent(type, { detail });
    } catch (e) {
        // IE11 fallback
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, false, false, detail);
        return event;
    }
}