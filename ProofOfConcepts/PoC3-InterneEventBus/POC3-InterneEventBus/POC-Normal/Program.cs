using System;
using System.Collections.Generic;

namespace EventBusPoC_Simpel
{
    // ==========================================
    // DE ABSTRACTIE
    // ==========================================
    public interface IEventBus
    {
        void Publish<T>(T @event) where T : class;
        void Subscribe<T>(Action<T> handler) where T : class;
    }

    // ==========================================
    // EEN SIMPEL EVENT
    // ==========================================
    public class BestellingAangemaaktEvent
    {
        public string BestellingId { get; set; }
        public string KlantNaam { get; set; }
    }

    // ==========================================
    // DE IN-MEMORY IMPLEMENTATIE
    // ==========================================
    public class InMemoryEventBus : IEventBus
    {
        private readonly Dictionary<Type, List<Delegate>> _handlers = new Dictionary<Type, List<Delegate>>();

        public void Subscribe<T>(Action<T> handler) where T : class
        {
            var type = typeof(T);
            if (!_handlers.ContainsKey(type)) _handlers[type] = new List<Delegate>();
            _handlers[type].Add(handler);
        }

        public void Publish<T>(T @event) where T : class
        {
            var type = typeof(T);
            if (_handlers.ContainsKey(type))
            {
                foreach (var handler in _handlers[type])
                {
                    ((Action<T>)handler)(@event);
                }
            }
        }
    }

    // ==========================================
    // COMPONENTEN (Gedragen zich als onafhankelijke modules)
    // ==========================================

    // Verantwoordelijk voor orderbeheer
    public class BestellingComponent
    {
        private readonly IEventBus _bus;
        public BestellingComponent(IEventBus bus) => _bus = bus;

        public void MaakNieuweBestelling(string id, string klant)
        {
            Console.WriteLine($"[BestellingComponent] Nieuwe bestelling {id} aangemaakt in database.");
            // We sturen alleen een bericht op de bus, we roepen GEEN andere componenten aan.
            _bus.Publish(new BestellingAangemaaktEvent { BestellingId = id, KlantNaam = klant });
        }
    }

    // Verantwoordelijk voor routeberekening
    public class PlanningComponent
    {
        public PlanningComponent(IEventBus bus)
        {
            // Luistert naar de bus. Weet niet wie de bestelling heeft gemaakt.
            bus.Subscribe<BestellingAangemaaktEvent>(OnBestellingAangemaakt);
        }

        private void OnBestellingAangemaakt(BestellingAangemaaktEvent @event)
        {
            Console.WriteLine($"[PlanningComponent] Event ontvangen! Starten met routeplanning voor {@event.BestellingId} (Klant: {@event.KlantNaam}).");
        }
    }

    // ==========================================
    // MAIN PROGRAMMA
    // ==========================================
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=== PoC: Abstractie & Losse Koppeling ===\n");

            // 1. Initialiseer de bus (De infrastructuur)
            IEventBus bus = new InMemoryEventBus();

            // 2. Start de componenten (De business logica)
            // Merk op: Ze krijgen alleen de interface 'IEventBus' mee.
            var planning = new PlanningComponent(bus);
            var bestelling = new BestellingComponent(bus);

            // 3. Actie!
            bestelling.MaakNieuweBestelling("ORD-001", "Ryan");

            Console.WriteLine("\nDemo voltooid. Druk op een toets...");
            Console.ReadKey();
        }
    }
}