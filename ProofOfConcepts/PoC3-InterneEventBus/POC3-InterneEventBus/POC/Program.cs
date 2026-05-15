using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EventBusPoC
{
    // ==========================================
    // STAP 1: DE ABSTRACTIE
    // ==========================================
    public interface IEventBus
    {
        void Publish<T>(T @event) where T : class;
        void Subscribe<T>(Action<T> handler) where T : class;
    }

    // ==========================================
    // STAP 2: DE EVENTS
    // ==========================================
    public class OrderCancelledEvent
    {
        public string OrderId { get; set; }
        public OrderCancelledEvent(string orderId) => OrderId = orderId;
    }

    public class RouteUpdatedEvent
    {
        public string OrderId { get; set; }
        public string NewRoute { get; set; }
        public RouteUpdatedEvent(string orderId, string newRoute)
        {
            OrderId = orderId;
            NewRoute = newRoute;
        }
    }

    // ==========================================
    // STAP 3: DE IN-MEMORY IMPLEMENTATIE
    // ==========================================
    public class InMemoryEventBus : IEventBus
    {
        // Een dictionary die bijhoudt welke 'handlers' (functies) naar welk event luisteren
        private readonly Dictionary<Type, List<Delegate>> _handlers = new Dictionary<Type, List<Delegate>>();

        public void Subscribe<T>(Action<T> handler) where T : class
        {
            var type = typeof(T);
            if (!_handlers.ContainsKey(type))
            {
                _handlers[type] = new List<Delegate>();
            }
            _handlers[type].Add(handler);
        }

        public void Publish<T>(T @event) where T : class
        {
            var type = typeof(T);
            if (_handlers.ContainsKey(type))
            {
                foreach (var handler in _handlers[type])
                {
                    // Voer de event handler asynchroon uit op een achtergrond thread
                    // Dit simuleert de chaos van een echt systeem waar dingen tegelijk gebeuren
                    Task.Run(() => ((Action<T>)handler)(@event));
                }
            }
        }
    }

    // ==========================================
    // STAP 4: DE COMPONENTEN (Met Race Condition Protectie)
    // ==========================================
    public class BestellingComponent
    {
        // De 'database' van dit component
        private string _orderStatus = "AANGEMAAKT";

        // Het 'slot' om data corruptie te voorkomen bij gelijktijdige bewerkingen
        private readonly object _orderLock = new object();

        public BestellingComponent(IEventBus eventBus)
        {
            // Het component abonneert zich op events, het weet NIET wie ze stuurt. (Losse koppeling!)
            eventBus.Subscribe<OrderCancelledEvent>(HandleOrderCancelled);
            eventBus.Subscribe<RouteUpdatedEvent>(HandleRouteUpdated);
        }

        private void HandleOrderCancelled(OrderCancelledEvent @event)
        {
            // LOCK: Zorgt dat er maar 1 thread tegelijk deze code mag uitvoeren voor deze bestelling
            lock (_orderLock)
            {
                Console.WriteLine($"[BestellingComponent] Ontvangen: Cancel event voor {@event.OrderId}. Bezig met verwerken...");
                Thread.Sleep(50); // Simuleer database verwerkingstijd

                _orderStatus = "GEANNULEERD";
                Console.WriteLine($"[BestellingComponent] Succes: Bestelling {@event.OrderId} is nu GEANNULEERD.");
            }
        }

        private void HandleRouteUpdated(RouteUpdatedEvent @event)
        {
            lock (_orderLock)
            {
                Console.WriteLine($"[BestellingComponent] Ontvangen: Route update voor {@event.OrderId} naar {@event.NewRoute}.");

                // RACE CONDITION PROTECTIE:
                // Als de bestelling al geannuleerd is, mogen we NOOIT meer een route toewijzen!
                if (_orderStatus == "GEANNULEERD")
                {
                    Console.WriteLine($"[BestellingComponent] FOUT/GEWEIGERD: Kan route '{@event.NewRoute}' niet toewijzen. Bestelling {@event.OrderId} is reeds geannuleerd!");
                    return;
                }

                Thread.Sleep(50); // Simuleer database verwerkingstijd
                _orderStatus = "INGEPLAND";
                Console.WriteLine($"[BestellingComponent] Succes: Route '{@event.NewRoute}' toegewezen aan bestelling {@event.OrderId}.");
            }
        }
    }

    // ==========================================
    // STAP 5: HET TEST SCENARIO
    // ==========================================
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=== Start PoC: Interne Event Bus ===");

            // We maken de Bus aan via de Interface
            IEventBus bus = new InMemoryEventBus();

            // We starten het component op en geven de bus mee (Dependency Injection)
            var bestellingComponent = new BestellingComponent(bus);

            Console.WriteLine("Situatie: De klant annuleert de order EXACT op het moment dat de planner hem inplant.");
            Console.WriteLine("Beide events worden tegelijk afgevuurd...\n");

            // We vuren de events tegelijkertijd af (Simulatie van een Race Condition)
            var cancelTask = Task.Run(() => bus.Publish(new OrderCancelledEvent("ORD-123")));
            var updateTask = Task.Run(() => bus.Publish(new RouteUpdatedEvent("ORD-123", "Route Antwerpen")));

            // Wacht tot beide klaar zijn
            await Task.WhenAll(cancelTask, updateTask);

            // Geef de achtergrond threads even tijd om de console lines te printen
            await Task.Delay(500);

            Console.WriteLine("\n=== Einde PoC ===");
            Console.ReadLine();
        }
    }
}