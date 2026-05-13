import { EventBus } from "../EventBus";

export class PlanningModule {
  constructor(bus: EventBus) {
    bus.subscribe("NEXT_DAY_DELIVERY_REQUESTED", ({ orderId }) => {
      console.log(
        `[Planning]      Re-routing order #${orderId} — priority flag set`,
      );
    });

    bus.subscribe("DELIVERY_ADDRESS_CHANGED", ({ orderId, newAddress }) => {
      console.log(
        `[Planning]      Re-routing order #${orderId} — new coordinates for "${newAddress}"`,
      );
    });
  }
}
