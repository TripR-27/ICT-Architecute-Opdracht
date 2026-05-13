import { EventBus } from "../EventBus";

export class OrderingModule {
  constructor(private bus: EventBus) {}

  requestNextDayDelivery(orderId: number) {
    console.log(
      `[Ordering]      Publishing: NEXT_DAY_DELIVERY_REQUESTED { orderId: ${orderId} }`,
    );
    this.bus.publish("NEXT_DAY_DELIVERY_REQUESTED", { orderId });
    // De ordering module heeft geen directe kennis van planning of notificatie
  }

  changeDeliveryAddress(orderId: number, newAddress: string) {
    console.log(
      `[Ordering]      Publishing: DELIVERY_ADDRESS_CHANGED { orderId: ${orderId}, newAddress: "${newAddress}" }`,
    );
    this.bus.publish("DELIVERY_ADDRESS_CHANGED", { orderId, newAddress });
  }
}
