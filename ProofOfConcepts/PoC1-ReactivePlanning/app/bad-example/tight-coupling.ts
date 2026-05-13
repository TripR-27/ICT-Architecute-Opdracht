/**
 * Tight coupling voorbeeld:
 * - OrderingModuleDirect heeft directe kennis van PlanningModuleDirect en NotificationModuleDirect.
 * - Wijzigingen in PlanningModuleDirect of NotificationModuleDirect kunnen leiden tot bugs in OrderingModuleDirect.
 * - OrderingModuleDirect is verantwoordelijk voor het aanroepen van beide modules,
 * wat leidt tot een complexere codebase.
 */

class PlanningModuleDirect {
  recalculateRoute(orderId: number, reason: string) {
    console.log(
      `[Planning]      Re-routing order #${orderId} — reason: ${reason}`,
    );
  }
}

class NotificationModuleDirect {
  alertSender(orderId: number, message: string) {
    console.log(
      `[Notification]  Sender alerted for order #${orderId}: ${message}`,
    );
  }
}

class OrderingModuleDirect {
  private planning: PlanningModuleDirect;
  private notification: NotificationModuleDirect;

  constructor() {
    this.planning = new PlanningModuleDirect();
    this.notification = new NotificationModuleDirect(); // <-- OrderingModule depends op Notification
  }

  requestNextDayDelivery(orderId: number) {
    console.log(
      `[Ordering]     Next-day delivery requested for order #${orderId}`,
    );
    this.planning.recalculateRoute(orderId, "next-day priority");
    this.notification.alertSender(
      orderId,
      "Your order is being re-routed for next-day delivery",
    );
  }

  changeDeliveryAddress(orderId: number, newAddress: string) {
    console.log(
      `[Ordering]     Address changed for order #${orderId} to "${newAddress}"`,
    );
    this.planning.recalculateRoute(orderId, `new address: ${newAddress}`); // direct call
  }
}

console.log("=== TIGHT COUPLING (the problem) ===\n");
const ordering = new OrderingModuleDirect();
ordering.requestNextDayDelivery(42);
console.log();
ordering.changeDeliveryAddress(43, "Kerkstraat 5, Gent");
