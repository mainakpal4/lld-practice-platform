import { Problem } from '../../domain/models/Problem';
import { Rubric } from '../../domain/models/Rubric';

export const SEED_PROBLEMS: Problem[] = [
  new Problem(
    'prob-parking-lot',
    'Design a Parking Lot System',
    'parking-lot',
    'Design a multi-floor parking lot system supporting multiple entry/exit gates, varied vehicle types, real-time spot allocation, dynamic fee calculation, and concurrent access without double-booking.',
    'INTERMEDIATE',
    'Facilities & Logistics',
    [
      { id: 'req-1', text: 'Support multiple vehicle types: Motorcycle, Compact Car, Large SUV/Truck, and Electric Vehicle.', type: 'FUNCTIONAL' },
      { id: 'req-2', text: 'Support multiple floors with designated spots (Compact, Large, Handicapped, EV Charging).', type: 'FUNCTIONAL' },
      { id: 'req-3', text: 'Issue parking ticket with timestamp and spot details upon entry at any gate.', type: 'FUNCTIONAL' },
      { id: 'req-4', text: 'Calculate parking fee upon exit based on vehicle type and duration using flexible pricing rules.', type: 'FUNCTIONAL' },
      { id: 'req-5', text: 'Prevent race conditions when multiple cars attempt to take the last available spot concurrently.', type: 'NON_FUNCTIONAL' },
      { id: 'req-6', text: 'High extensibility: Adding a new vehicle type or pricing algorithm must not alter core lot coordination.', type: 'NON_FUNCTIONAL' },
    ],
    new Rubric('rubric-parking-lot', 'prob-parking-lot', [
      { id: 'req_understanding', name: 'Requirements & Scope Definition', weight: 15, description: 'Clear vehicle-to-spot compatibility rules and scope limits.', maxScore: 10 },
      { id: 'class_responsibilities', name: 'Class Responsibilities & Cohesion (SRP)', weight: 25, description: 'Separation between spots, tickets, payment, and allocation.', maxScore: 10 },
      { id: 'coupling_interfaces', name: 'Coupling, Encapsulation & Interfaces', weight: 20, description: 'Decoupled strategies for spot allocation and fee calculation.', maxScore: 10 },
      { id: 'pattern_usage', name: 'Design Pattern Appropriateness', weight: 15, description: 'Appropriate use of Strategy, Factory, or Observer.', maxScore: 10 },
      { id: 'extensibility', name: 'Extensibility & Evolution (OCP)', weight: 15, description: 'Ease of adding new vehicle types and pricing rules.', maxScore: 10 },
      { id: 'concurrency_edge_cases', name: 'Concurrency & Edge Cases', weight: 10, description: 'Guards against race conditions on spot reservation.', maxScore: 10 },
    ]),
    {
      assumptions: `- Single facility with N floors, M gates.\n- Payment occurs at exit gate before departure.\n- Spot allocation policy can vary (e.g. Nearest to entry gate, Lowest floor first).`,
      classDiagramMermaid: `classDiagram
    class Vehicle {
        <<abstract>>
        +string licensePlate
        +VehicleType type
    }
    class ParkingSpot {
        +string spotId
        +SpotType type
        +boolean isOccupied
        +assignVehicle(Vehicle)
        +vacate()
    }
    class Ticket {
        +string ticketNumber
        +DateTime entryTime
        +ParkingSpot spot
        +Vehicle vehicle
    }
    class IParkingStrategy {
        <<interface>>
        +findSpot(List~ParkingSpot~, Vehicle) ParkingSpot
    }
    class IPricingStrategy {
        <<interface>>
        +calculateFee(Ticket, DateTime) double
    }
    class ParkingLot {
        -List~ParkingFloor~ floors
        -IParkingStrategy allocationStrategy
        +parkVehicle(Vehicle) Ticket
        +unparkVehicle(Ticket) double
    }
    Vehicle <|-- Car
    Vehicle <|-- Motorcycle
    IParkingStrategy <|.. NearestFirstStrategy
    IPricingStrategy <|.. HourlyPricingStrategy
    ParkingLot --> IParkingStrategy
    ParkingLot --> IPricingStrategy`,
      classSkeletonCode: `// Vehicle domain
public enum VehicleType { MOTORCYCLE, CAR, TRUCK, ELECTRIC }
public enum SpotType { COMPACT, LARGE, MOTORCYCLE, EV }

public abstract class Vehicle {
    protected String licensePlate;
    protected VehicleType type;
    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
}

// Strategy for spot allocation
public interface IParkingStrategy {
    ParkingSpot findSpot(List<ParkingFloor> floors, Vehicle vehicle);
}

// Strategy for pricing
public interface IPricingStrategy {
    double calculateFee(Ticket ticket, Instant exitTime);
}

public class ParkingSpot {
    private final String id;
    private final SpotType spotType;
    private volatile boolean isAvailable = true;
    private Vehicle currentVehicle;

    public synchronized boolean park(Vehicle vehicle) {
        if (!isAvailable) return false;
        this.currentVehicle = vehicle;
        this.isAvailable = false;
        return true;
    }

    public synchronized void vacate() {
        this.currentVehicle = null;
        this.isAvailable = true;
    }
}`,
      designPatterns: `1. Strategy Pattern: For spot allocation (e.g. NearestToGateStrategy, LowestFloorStrategy) and fee calculation (Hourly, PeakHours, FlatRate).
2. Factory Pattern: For creating appropriate ParkingSpot and Vehicle instances.
3. Singleton Pattern (optional): For the central ParkingLot coordination instance.`,
      tradeOffsAndEdgeCases: `1. Concurrency: Synchronized park() method on ParkingSpot prevents double-booking when multiple gates assign spots concurrently.
2. Full Capacity: When no suitable spot is available, parkVehicle returns null or throws ParkingFullException gracefully without blocking threads.
3. Lost Tickets: Handled by a fallback LostTicketPricingStrategy charging maximum daily tariff.`,
    },
    ['Strategy Pattern', 'Thread Safety', 'Polymorphism', 'Extensible Pricing']
  ),

  new Problem(
    'prob-elevator-system',
    'Design an Elevator Control System',
    'elevator-system',
    'Design an intelligent multi-car elevator control system for a high-rise building that coordinates internal passenger requests and external floor calls efficiently using dispatching algorithms.',
    'ADVANCED',
    'Transportation & Automation',
    [
      { id: 'req-1', text: 'Support multiple elevator cars across N floors.', type: 'FUNCTIONAL' },
      { id: 'req-2', text: 'Distinguish between Hall Requests (up/down from outside) and Cabin Requests (destination inside car).', type: 'FUNCTIONAL' },
      { id: 'req-3', text: 'Elevator state machine: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE.', type: 'FUNCTIONAL' },
      { id: 'req-4', text: 'Pluggable scheduling/dispatching algorithm (e.g., SCAN/Elevator algorithm, FCFS, Shortest Seek Time First).', type: 'FUNCTIONAL' },
      { id: 'req-5', text: 'Safety edge cases: Emergency stop, weight limit breach, door obstruction sensor.', type: 'NON_FUNCTIONAL' },
      { id: 'req-6', text: 'High throughput and minimal passenger wait time under peak morning/evening traffic.', type: 'NON_FUNCTIONAL' },
    ],
    new Rubric('rubric-elevator', 'prob-elevator-system', [
      { id: 'req_understanding', name: 'Requirements & Scope Definition', weight: 15, description: 'Separation of internal cabin calls from external hall calls.', maxScore: 10 },
      { id: 'class_responsibilities', name: 'Class Responsibilities & Cohesion (SRP)', weight: 25, description: 'Decoupled ElevatorCar, Dispatcher, and SchedulingAlgorithm.', maxScore: 10 },
      { id: 'coupling_interfaces', name: 'Coupling, Encapsulation & Interfaces', weight: 20, description: 'Interface-driven dispatching and state machine encapsulation.', maxScore: 10 },
      { id: 'pattern_usage', name: 'Design Pattern Appropriateness', weight: 15, description: 'State pattern for elevator motion; Strategy for scheduling.', maxScore: 10 },
      { id: 'extensibility', name: 'Extensibility & Evolution (OCP)', weight: 15, description: 'Pluggable scheduling algorithms without modifying elevator hardware wrapper.', maxScore: 10 },
      { id: 'concurrency_edge_cases', name: 'Concurrency & Edge Cases', weight: 10, description: 'Concurrent hall call registrations and thread-safe queue updates.', maxScore: 10 },
    ]),
    {
      assumptions: `- Building with K elevator cars and N floors.\n- Floor buttons send requests to central Dispatcher.\n- Internal buttons directly register destination in the active car queue.`,
      classDiagramMermaid: `classDiagram
    class ElevatorState {
        <<interface>>
        +move()
        +openDoor()
        +closeDoor()
    }
    class IdleState
    class MovingUpState
    class MovingDownState
    ElevatorState <|.. IdleState
    ElevatorState <|.. MovingUpState
    ElevatorState <|.. MovingDownState
    class IElevatorDispatcher {
        <<interface>>
        +assignRequest(HallRequest, List~ElevatorCar~) ElevatorCar
    }
    class ElevatorCar {
        +int currentFloor
        +ElevatorState state
        +TreeSet~int~ upStops
        +TreeSet~int~ downStops
        +pressFloorButton(int floor)
    }
    ElevatorCar --> ElevatorState
    ElevatorSystem --> IElevatorDispatcher`,
      classSkeletonCode: `public enum Direction { UP, DOWN, IDLE }

public interface IElevatorState {
    void handleRequest(ElevatorCar car, int destinationFloor);
    void step(ElevatorCar car);
}

public interface IElevatorDispatcher {
    ElevatorCar selectElevator(List<ElevatorCar> cars, int sourceFloor, Direction direction);
}

public class ElevatorCar {
    private final int id;
    private int currentFloor = 1;
    private Direction currentDirection = Direction.IDLE;
    private IElevatorState state;
    private final ConcurrentSkipListSet<Integer> targetFloors = new ConcurrentSkipListSet<>();

    public synchronized void addDestination(int floor) {
        targetFloors.add(floor);
    }
}`,
      designPatterns: `1. State Pattern: Models Elevator states (IdleState, MovingUpState, MovingDownState, DoorOpenState).
2. Strategy Pattern: For Dispatcher algorithms (LOOK/SCAN, MinWaitingTimeStrategy).
3. Observer Pattern: For broadcasting floor arrival to UI displays and bell chimes.`,
      tradeOffsAndEdgeCases: `1. SCAN/LOOK Algorithm vs FCFS: FCFS leads to starvation under heavy load; LOOK algorithm keeps moving in current direction until all pending calls are satisfied.
2. Concurrent button presses: Thread-safe collections (ConcurrentSkipListSet) ensure deterministic stops without locking the entire car movement loop.`,
    },
    ['State Pattern', 'Strategy Pattern', 'SCAN Algorithm', 'Thread Safety']
  ),

  new Problem(
    'prob-vending-machine',
    'Design a Vending Machine',
    'vending-machine',
    'Design an automated vending machine that accepts cash/cards, dispenses selected items, computes change accurately, and manages state transitions gracefully even during cancellations or power faults.',
    'BEGINNER',
    'Retail Automation',
    [
      { id: 'req-1', text: 'Select product from available inventory slots.', type: 'FUNCTIONAL' },
      { id: 'req-2', text: 'Accept coins and notes of valid denominations.', type: 'FUNCTIONAL' },
      { id: 'req-3', text: 'Calculate and dispense exact change, or refund if transaction canceled.', type: 'FUNCTIONAL' },
      { id: 'req-4', text: 'State transitions: IDLE -> HAS_MONEY -> DISPENSING -> SOLD_OUT.', type: 'FUNCTIONAL' },
      { id: 'req-5', text: 'Transactional consistency: Deduct inventory only upon confirmed dispensing; refund on failure.', type: 'NON_FUNCTIONAL' },
    ],
    new Rubric('rubric-vending-machine', 'prob-vending-machine', [
      { id: 'req_understanding', name: 'Requirements & Scope Definition', weight: 15, description: 'Clear product catalog, coin handling, and change return rules.', maxScore: 10 },
      { id: 'class_responsibilities', name: 'Class Responsibilities & Cohesion (SRP)', weight: 25, description: 'Separation of inventory, cash register, and state machine.', maxScore: 10 },
      { id: 'coupling_interfaces', name: 'Coupling, Encapsulation & Interfaces', weight: 20, description: 'Interface-based state contract preventing illegal state transitions.', maxScore: 10 },
      { id: 'pattern_usage', name: 'Design Pattern Appropriateness', weight: 15, description: 'State Pattern for machine lifecycle.', maxScore: 10 },
      { id: 'extensibility', name: 'Extensibility & Evolution (OCP)', weight: 15, description: 'Ability to add card/UPI payments without changing dispensing core.', maxScore: 10 },
      { id: 'concurrency_edge_cases', name: 'Concurrency & Edge Cases', weight: 10, description: 'Handling out-of-stock items, insufficient change, and refund rollback.', maxScore: 10 },
    ]),
    {
      assumptions: `- Fixed slot capacity for products.\n- Cash register maintains counts of each coin denomination (e.g. $1, $2, $5).\n- Only one customer interaction active at a time.`,
      classDiagramMermaid: `classDiagram
    class IVendingState {
        <<interface>>
        +insertMoney(double amount)
        +selectItem(string code)
        +dispenseItem()
        +cancelTransaction()
    }
    class IdleState
    class HasMoneyState
    class DispensingState
    IVendingState <|.. IdleState
    IVendingState <|.. HasMoneyState
    IVendingState <|.. DispensingState
    class VendingMachine {
        -IVendingState currentState
        -Inventory inventory
        -CashRegister cashRegister
        +setState(IVendingState)
    }
    VendingMachine --> IVendingState`,
      classSkeletonCode: `public interface IVendingState {
    void insertCoin(VendingMachine machine, Coin coin);
    void selectProduct(VendingMachine machine, String productCode);
    void dispense(VendingMachine machine);
    List<Coin> refund(VendingMachine machine);
}

public class VendingMachine {
    private IVendingState state;
    private final Inventory inventory;
    private final CashRegister cashRegister;
    private double currentBalance;

    public void setState(IVendingState newState) {
        this.state = newState;
    }
}`,
      designPatterns: `1. State Pattern: Encapsulates state-dependent behaviors (IdleState, HasMoneyState, DispensingState, SoldOutState).
2. Factory Pattern: For creating coin handlers and payment gateways.`,
      tradeOffsAndEdgeCases: `1. Insufficient Change in Register: Check if exact change is available before moving to DispensingState; if not, reject transaction and refund.
2. Item Jam / Motor Failure: If sensor detects item failed to drop, refund customer balance and rollback inventory deduction.`,
    },
    ['State Pattern', 'Transactional Rollback', 'Inventory Management']
  ),

  new Problem(
    'prob-rate-limiter',
    'Design an In-Memory Rate Limiter Library',
    'rate-limiter',
    'Design an extensible, thread-safe in-memory rate limiting library that throttles incoming client requests based on configurable thresholds, algorithms, and identification keys (e.g. user ID, IP address).',
    'ADVANCED',
    'Infrastructure & Reliability',
    [
      { id: 'req-1', text: 'Support rate limiting by client key (API Key, User ID, IP address).', type: 'FUNCTIONAL' },
      { id: 'req-2', text: 'Pluggable algorithms: Token Bucket, Leaky Bucket, Sliding Window Counter.', type: 'FUNCTIONAL' },
      { id: 'req-3', text: 'Return limit status: isAllowed(), remainingTokens, retryAfterSeconds.', type: 'FUNCTIONAL' },
      { id: 'req-4', text: 'Thread safety: Millions of requests must not cause race conditions or memory leaks.', type: 'NON_FUNCTIONAL' },
      { id: 'req-5', text: 'Memory efficiency: Evict stale client keys automatically to avoid unbounded heap growth.', type: 'NON_FUNCTIONAL' },
    ],
    new Rubric('rubric-rate-limiter', 'prob-rate-limiter', [
      { id: 'req_understanding', name: 'Requirements & Scope Definition', weight: 15, description: 'Clear API contract and metric definitions.', maxScore: 10 },
      { id: 'class_responsibilities', name: 'Class Responsibilities & Cohesion (SRP)', weight: 25, description: 'Separation between limiter strategy, storage bucket, and key extractor.', maxScore: 10 },
      { id: 'coupling_interfaces', name: 'Coupling, Encapsulation & Interfaces', weight: 20, description: 'Interface IRateLimiterAlgorithm decoupling caller from algorithm.', maxScore: 10 },
      { id: 'pattern_usage', name: 'Design Pattern Appropriateness', weight: 15, description: 'Strategy Pattern for rate limiting algorithms; Decorator or Factory.', maxScore: 10 },
      { id: 'extensibility', name: 'Extensibility & Evolution (OCP)', weight: 15, description: 'Pluggable storage backends (in-memory vs Redis) and custom algorithms.', maxScore: 10 },
      { id: 'concurrency_edge_cases', name: 'Concurrency & Edge Cases', weight: 10, description: 'Atomic operations (AtomicLong / CAS) preventing race conditions under high concurrency.', maxScore: 10 },
    ]),
    {
      assumptions: `- In-process library embedded in application.\n- Millisecond resolution for window evaluations.\n- Sliding window counter provides balanced accuracy and low memory footprint.`,
      classDiagramMermaid: `classDiagram
    class IRateLimiter {
        <<interface>>
        +allowRequest(string key) RateLimitResult
    }
    class IRateLimitAlgorithm {
        <<interface>>
        +checkLimit(string key, RateLimitRule rule) boolean
    }
    class TokenBucketAlgorithm
    class SlidingWindowCounterAlgorithm
    IRateLimitAlgorithm <|.. TokenBucketAlgorithm
    IRateLimitAlgorithm <|.. SlidingWindowCounterAlgorithm
    class RateLimiterService {
        -Map~string, IRateLimitAlgorithm~ algorithms
        -IRateLimitAlgorithm activeAlgorithm
        +allowRequest(string key) RateLimitResult
    }
    RateLimiterService --> IRateLimitAlgorithm`,
      classSkeletonCode: `public interface IRateLimitAlgorithm {
    boolean allowRequest(String clientId, int capacity, Duration refillRate);
}

public class TokenBucketAlgorithm implements IRateLimitAlgorithm {
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    private static class TokenBucket {
        private final long capacity;
        private final AtomicLong tokens;
        private final AtomicLong lastRefillTimestamp;

        public TokenBucket(long capacity) {
            this.capacity = capacity;
            this.tokens = new AtomicLong(capacity);
            this.lastRefillTimestamp = new AtomicLong(System.currentTimeMillis());
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens.get() > 0) {
                tokens.decrementAndGet();
                return true;
            }
            return false;
        }

        private void refill() { /* Refill logic */ }
    }
}`,
      designPatterns: `1. Strategy Pattern: To swap between Token Bucket, Leaky Bucket, and Sliding Window algorithms without modifying the filter middleware.
2. Factory Pattern: To construct rate limiters with pre-configured thresholds per tier (Free, Pro, Enterprise).`,
      tradeOffsAndEdgeCases: `1. Memory Leak on High Cardinality Client Keys: Expire inactive keys using an LRU cache or scheduled cleanup daemon.
2. High Concurrency: Atomic operations or striped locks per client key avoid global lock contention.`,
    },
    ['Strategy Pattern', 'Atomic Operations', 'Concurrency & Lock Contention', 'Memory Leak Prevention']
  )
];
