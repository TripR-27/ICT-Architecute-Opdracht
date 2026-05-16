/**
 * Een hele simpele event bus implementatie om de hoofd-PoC te ondersteunen
 * Voor de volledige uitwerking bekijk PoC3-InterneEventBus
 */
type Handler = (payload: any) => void;

export class EventBus {
  private listeners: Map<string, Handler[]> = new Map();

  subscribe(event: string, handler: Handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }

  publish(event: string, payload: any): void {
    this.listeners.get(event)?.forEach((handler) => {
      setImmediate(() => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[EventBus] Handler voor '${event}' faalde:`, err);
        }
      });
    });
  }
}
