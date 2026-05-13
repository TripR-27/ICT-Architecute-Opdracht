import { EventBus } from "./EventBus";
import { OrderingModule } from "./modules/OrderingModule";
import { PlanningModule } from "./modules/PlanningModule";
import { NotificationModule } from "./modules/NotificationModule";

const bus = new EventBus();

new PlanningModule(bus);
new NotificationModule(bus);

const ordering = new OrderingModule(bus);

console.log("=== EVENT-DRIVEN (the solution) ===\n");

ordering.requestNextDayDelivery(42);
console.log();
ordering.changeDeliveryAddress(43, "Kerkstraat 5, Gent");
