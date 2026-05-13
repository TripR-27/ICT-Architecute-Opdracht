import { EventBus } from "../EventBus";

export class NotificationModule {
  constructor(bus: EventBus) {
    bus.subscribe("NEXT_DAY_DELIVERY_REQUESTED", ({ orderId }) => {
      console.log(
        `[Notification]  Sender notified: order #${orderId} re-routed for next-day delivery`,
      );
    });

    bus.subscribe("DELIVERY_ADDRESS_CHANGED", ({ orderId, newAddress }) => {
      console.log(
        `[Notification]  Recipient notified: delivery address for order #${orderId} updated to "${newAddress}"`,
      );
    });

    bus.subscribe("PLANNING_FAILED", ({ orderId, reason }) => {
      console.warn(
        `[Notification]  Customer alerted: planning failed for order #${orderId} — "${reason}"`,
      );
    });
  }
}
