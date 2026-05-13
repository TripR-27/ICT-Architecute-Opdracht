import { EventBus } from "../EventBus";

export class PlanningModule {
  constructor(bus: EventBus) {
    bus.subscribe("NEXT_DAY_DELIVERY_REQUESTED", ({ orderId }) => {
      try {
        if (Math.random() < 0.2) throw new Error("Route optimisation failed: no available driver");
        console.log(`[Planning]      Re-routing order #${orderId} — priority flag set`);
      } catch (err: any) {
        console.error(`[Planning]      ERROR for order #${orderId}: ${err.message}`);
        bus.publish("PLANNING_FAILED", { orderId, reason: err.message });
      }
    });

    bus.subscribe("DELIVERY_ADDRESS_CHANGED", ({ orderId, newAddress }) => {
      console.log(
        `[Planning]      Re-routing order #${orderId} — new coordinates for "${newAddress}"`,
      );
    });
  }
}
