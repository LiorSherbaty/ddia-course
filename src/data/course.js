export const DAYS = [
  {
    id: 1,
    title: "Reliability, Scalability, Maintainability & Data Models",
    shortTitle: "Day 1",
    chapters: "Chapters 1–2",
    theme: "The language of good answers",
    duration: "6–8 hours",
    interviewerTesting: "Whether you can reason before you prescribe. Weak candidates jump to tools. Strong candidates talk about failure modes, load shape, consistency needs, and why the simplest architecture is usually correct today.",
    outcome: "Define reliability, scalability, and maintainability precisely. Explain why averages lie. Choose between relational and document modeling. Answer 'how would you start?' without sounding like a tool salesman.",
    sections: [
      {
        id: "1.1",
        title: "Reliability",
        blocks: [
          {
            type: "interview-quote",
            text: "A fault is one component misbehaving. A failure is the system no longer delivering required service. Good architecture stops local faults from becoming visible failures."
          },
          {
            type: "text",
            text: "Three fault sources, ranked by actual outage frequency:"
          },
          {
            type: "numbered-list",
            items: [
              "Human error — bad config, bad deploy (#1 cause)",
              "Software bugs — cascading failures, resource leaks",
              "Hardware — disk failure, NIC death"
            ]
          },
          {
            type: "text",
            text: "Practical patterns: retries with limits, timeouts, health checks, gradual rollout, feature flags, redundancy, idempotency, chaos testing mindset."
          }
        ]
      },
      {
        id: "1.2",
        title: "Scalability",
        blocks: [
          {
            type: "text",
            text: "Scalability is not a property you 'have.' It is always: scalable with respect to which load parameter?"
          },
          {
            type: "text",
            text: "OrderFlow load parameters: orders/sec, product reads/sec, checkout concurrency, data volume, write/read ratio, fan-out per request."
          },
          {
            type: "subheading",
            text: "Performance is a distribution"
          },
          {
            type: "text",
            text: "Track p50, p95, p99, p999 — not averages. Tail latency amplification: if checkout calls 4 services in parallel and each has 1% chance of being slow, the page-level slowness probability is ~4%."
          },
          {
            type: "code",
            lang: "csharp",
            label: ".NET — Percentile Tracker",
            code: `public sealed class LatencyTracker
{
    private readonly ConcurrentBag<double> _samples = new();

    public void Record(double ms) => _samples.Add(ms);

    public LatencyReport Snapshot()
    {
        var sorted = _samples.OrderBy(x => x).ToArray();
        if (sorted.Length == 0) return new(0, 0, 0, 0, 0, 0);
        return new(sorted.Length, P(sorted, .50), P(sorted, .95),
                    P(sorted, .99), P(sorted, .999), sorted[^1]);
    }

    static double P(double[] s, double p) =>
        s[Math.Clamp((int)Math.Ceiling(p * s.Length) - 1, 0, s.Length - 1)];
}

public record LatencyReport(int Count, double P50, double P95, double P99, double P999, double Max);`
          }
        ]
      },
      {
        id: "1.3",
        title: "Maintainability",
        blocks: [
          {
            type: "list",
            items: [
              "Operability — easy to run",
              "Simplicity — easy to understand",
              "Evolvability — easy to change safely"
            ]
          },
          {
            type: "text",
            text: "A clever design that nobody can safely modify is deferred downtime."
          },
          {
            type: "say",
            text: "Start with a modular monolith unless a hard reason says otherwise. Simpler deployment, real local transactions, fewer network failure modes."
          }
        ]
      },
      {
        id: "1.4",
        title: "Data Models",
        blocks: [
          {
            type: "text",
            text: "Relational when: entities have strong relationships, correctness matters, joins matter, constraints matter."
          },
          {
            type: "text",
            text: "Document-like when: records are self-contained, shape varies by subtype, denormalized reads dominate."
          },
          {
            type: "say",
            text: "For the core write path I usually prefer relational, especially when invariants and relationships matter. I use JSONB or denormalized projections for flexible or read-heavy shapes."
          },
          {
            type: "dont",
            text: "SQL is old. NoSQL is more scalable."
          },
          {
            type: "code",
            lang: "csharp",
            label: "OrderFlow Day 1 Model",
            code: `public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CustomerId { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = new();
}

public sealed class Product
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string AttributesJson { get; set; } = "{}"; // JSONB in PostgreSQL
}`
          },
          {
            type: "radwork",
            text: "Order → study/work item. Product attributes JSON → modality/vendor-specific metadata. Relational core → assignment, status, ownership, audit. Document-like projection → worklist view, search result."
          }
        ]
      }
    ],
    lab: [
      "Create orders, order_items, products tables in PostgreSQL",
      "Seed 100 products",
      "Add endpoint to create an order and fetch by ID",
      "Record request latencies and print p50/p95/p99"
    ],
    claudePrompts: [
      "Explain reliability, scalability, and maintainability like I'm in a system design interview. For each, give me one good sentence I can say out loud.",
      "I will describe a backend service and you tell me whether I'm prematurely optimizing, under-designing, or choosing the wrong data model. Push back on every vague word."
    ],
    quiz: [
      { q: "Is a fault the same thing as a failure?", a: "No. Fault = component deviating from spec. Failure = system failing to deliver service." },
      { q: "Is 'scalable' meaningful without a load parameter?", a: "No. Always: scalable with respect to what?" },
      { q: "Why is p99 often more useful than average latency?", a: "Users experience tails, not averages. Composed calls amplify tails." },
      { q: "When is relational modeling a better default than document?", a: "When relationships and correctness matter." },
      { q: "Why is modular monolith often a strong starting point?", a: "Local transactions, simpler deployment, fewer network failure modes." }
    ],
    speakDrill: { minutes: 2, topics: ["What reliability means", "Why averages are weak", "Why you'd start with PostgreSQL for OrderFlow"] }
  },

  {
    id: 2,
    title: "Storage Engines, Indexing, OLTP vs OLAP, Schema Evolution",
    shortTitle: "Day 2",
    chapters: "Chapters 3–4",
    theme: "Explain performance and safe change",
    duration: "6–8 hours",
    interviewerTesting: "Can you connect data structures to behavior? This is the day where 'databases are magic' dies.",
    outcome: "Explain B-tree vs LSM-tree at interview level, why a query is slow, OLTP vs OLAP, star schema for analytics, and safe schema evolution during rolling deployments.",
    sections: [
      {
        id: "2.1",
        title: "B-tree vs LSM-tree",
        blocks: [
          {
            type: "text",
            text: "B-tree (PostgreSQL, SQL Server, MySQL): page-oriented, update in place, predictable reads. A 4-level B-tree with branching factor 500 holds 500⁴ = 62.5 billion keys — 4 disk reads to find anything."
          },
          {
            type: "text",
            text: "LSM-tree (Cassandra, RocksDB, InfluxDB): append-oriented, buffer in memory, flush sorted runs, compact later. Great write throughput. Read amplification and compaction spikes are the trade-off."
          },
          {
            type: "say",
            text: "For read-heavy OLTP and rich queries I'd default to B-tree-backed PostgreSQL. For high-ingest append-heavy workloads, LSM-based systems are often better because they turn random writes into sequential writes."
          },
          {
            type: "code",
            lang: "sql",
            label: "See the B-tree in Action",
            code: `CREATE TABLE large_orders AS
SELECT gen_random_uuid() AS id,
       'CUST-' || (random()*10000)::int AS customer_id,
       (random()*1000)::numeric(10,2) AS total_amount,
       NOW() - (random()*365 || ' days')::interval AS created_at
FROM generate_series(1, 1000000);

CREATE INDEX idx_large_orders_customer ON large_orders(customer_id);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM large_orders WHERE customer_id = 'CUST-42';
-- Read the plan. Look at buffers. Stop treating query performance as mystical.`
          }
        ]
      },
      {
        id: "2.2",
        title: "Indexes Follow Access Patterns",
        blocks: [
          {
            type: "text",
            text: "Indexes trade more storage + slower writes for faster reads. Add them for real query patterns, not vibes."
          },
          {
            type: "code",
            lang: "sql",
            label: "Compound Index Example",
            code: `-- OrderFlow: "most recent 50 orders for one customer"
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at_utc DESC);`
          },
          {
            type: "subheading",
            text: "Keyset Pagination — Interviewers Notice This"
          },
          {
            type: "code",
            lang: "csharp",
            label: "Keyset Pagination with Dapper",
            code: `public async Task<IReadOnlyList<OrderRow>> GetNextPageAsync(
    DateTime? cursor, CancellationToken ct)
{
    const string sql = """
        SELECT id, customer_id, total_amount, status, created_at_utc
        FROM orders
        WHERE (@cursor IS NULL OR created_at_utc < @cursor)
        ORDER BY created_at_utc DESC
        LIMIT 50;
        """;

    await using var conn = new NpgsqlConnection(_connStr);
    var rows = await conn.QueryAsync<OrderRow>(
        new CommandDefinition(sql, new { cursor }, cancellationToken: ct));
    return rows.ToList();
}
// Why this beats OFFSET: OFFSET scans and discards rows. Keyset seeks via index.`
          }
        ]
      },
      {
        id: "2.3",
        title: "OLTP vs OLAP",
        blocks: [
          {
            type: "table",
            headers: ["", "OLTP", "OLAP"],
            rows: [
              ["Queries", "Point reads/writes by key", "Large scans, aggregations"],
              ["Bottleneck", "Disk seeks (latency)", "Disk bandwidth (throughput)"],
              ["Storage", "Row-oriented", "Column-oriented"]
            ]
          },
          {
            type: "say",
            text: "I would not let analytics workloads bully the OLTP database. If reporting becomes heavy, I'd push it into a derived analytics store."
          },
          {
            type: "code",
            lang: "sql",
            label: "Star Schema for Analytics",
            code: `CREATE TABLE dim_customer (customer_key SERIAL PRIMARY KEY, customer_id VARCHAR(100), name VARCHAR(200));
CREATE TABLE dim_product  (product_key SERIAL PRIMARY KEY, product_id VARCHAR(50), name VARCHAR(200), category VARCHAR(100));
CREATE TABLE dim_date     (date_key INT PRIMARY KEY, full_date DATE, month INT, quarter INT, year INT);

CREATE TABLE fact_order_items (
    id BIGSERIAL PRIMARY KEY,
    customer_key INT REFERENCES dim_customer(customer_key),
    product_key  INT REFERENCES dim_product(product_key),
    date_key     INT REFERENCES dim_date(date_key),
    quantity INT, unit_price NUMERIC(10,2), total_price NUMERIC(10,2));

-- "Revenue by category by quarter" — now fast
SELECT dp.category, dd.quarter, dd.year, SUM(f.total_price) as revenue
FROM fact_order_items f
JOIN dim_product dp ON f.product_key = dp.product_key
JOIN dim_date dd ON f.date_key = dd.date_key
GROUP BY dp.category, dd.quarter, dd.year;`
          }
        ]
      },
      {
        id: "2.4",
        title: "Safe Schema Evolution",
        blocks: [
          {
            type: "text",
            text: "Rolling deployments mean old and new code coexist. Safe changes: add nullable columns, add fields with defaults, make readers tolerant of unknown fields, backfill in phases, tighten constraints only after full rollout."
          },
          {
            type: "text",
            text: "Never during a rolling deploy: rename, drop, or change types of existing fields."
          },
          {
            type: "code",
            lang: "csharp",
            label: "Backward-Compatible API Versioning",
            code: `// V1 — shipped today
public sealed class OrderResponseV1
{
    public Guid Id { get; set; }
    public string CustomerId { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "";
}

// V2 — new fields are nullable with defaults → backward compatible
public sealed class OrderResponseV2
{
    public Guid Id { get; set; }
    public string CustomerId { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "";
    public DateTime? EstimatedDeliveryUtc { get; set; }  // new
    public string? TrackingNumber { get; set; }           // new
}`
          },
          {
            type: "radwork",
            text: "Decide: what stays transactional in PostgreSQL, what becomes search/index projection, what reporting gets pushed out, how versioned contracts tolerate mixed deployments across services."
          }
        ]
      }
    ],
    lab: [
      "Run EXPLAIN ANALYZE with and without an index — compare buffers",
      "Compare insert speed before and after adding two indexes",
      "Implement keyset pagination with Dapper",
      "Add a nullable column safely and update the API contract"
    ],
    claudePrompts: [
      "I'm in a system design interview. Explain B-tree vs LSM-tree in 90 seconds using an order system example. Then tell me what not to say.",
      "I'll paste a SQL query and an index definition. Tell me whether the index matches the query pattern, and if not, what to change.",
      "Explain safe schema evolution during rolling deployment for a .NET API + PostgreSQL backend. Use concrete examples, not abstract theory."
    ],
    quiz: [
      { q: "Why are indexes not 'free'?", a: "They cost write performance and storage." },
      { q: "Why is OFFSET pagination painful at scale?", a: "OFFSET scans and discards rows. Gets worse linearly." },
      { q: "What workload fits OLAP better than OLTP?", a: "Large scans and aggregations across millions of rows." },
      { q: "Why is adding a nullable column usually safe?", a: "Old code ignores it; new code uses it with defaults." },
      { q: "What is a star schema's fact table?", a: "The big table (millions of rows) containing metrics, with foreign keys to small dimension tables." }
    ],
    speakDrill: { minutes: 2, topics: ["B-tree vs LSM-tree", "Why the right index matters more than hype", "How you'd evolve an API contract safely"] }
  },

  {
    id: 3,
    title: "Replication, Partitioning & The Outbox Pattern",
    shortTitle: "Day 3",
    chapters: "Chapters 5–6",
    theme: "Core scaling and stale-read territory",
    duration: "6–8 hours",
    interviewerTesting: "Whether you understand that scaling reads and scaling writes are different games.",
    outcome: "Explain replication models, stale-read bugs, partition key trade-offs, and the outbox pattern.",
    sections: [
      {
        id: "3.1",
        title: "Replication Models — Know All Three",
        blocks: [
          {
            type: "text",
            text: "Single-leader: one writer, N readers. Simple, battle-tested. PostgreSQL, MySQL, SQL Server default."
          },
          {
            type: "text",
            text: "Multi-leader: multiple writers, conflict resolution required. Multi-region use case."
          },
          {
            type: "text",
            text: "Leaderless: quorum (W+R>N). Higher availability. Cassandra, DynamoDB."
          },
          {
            type: "say",
            text: "For most systems I'd start with leader-based replication. I'd reach for multi-leader or leaderless only when the write topology truly demands it."
          }
        ]
      },
      {
        id: "3.2",
        title: "Replication Lag Leaks to Users",
        blocks: [
          {
            type: "table",
            headers: ["Bug", "Example", "Fix"],
            rows: [
              ["Read-your-own-writes", "User places order, refreshes, doesn't see it", "Route to primary after writes"],
              ["Monotonic reads", "Worklist flickers between states", "Sticky sessions"],
              ["Consistent prefix", "AI finding appears before the study it references", "Causal tracking"]
            ]
          },
          {
            type: "say",
            text: "Replication lag is not just an infra detail. It changes what users observe. I'd decide explicitly which endpoints tolerate stale reads and which must hit the primary."
          },
          {
            type: "code",
            lang: "csharp",
            label: "Freshness-Aware Read Routing",
            code: `public sealed class ReadRouter
{
    private readonly string _primary;
    private readonly string _replica;

    public ReadRouter(string primary, string replica)
    { _primary = primary; _replica = replica; }

    public string GetConnectionString(DateTime? lastWriteUtc)
    {
        bool mustReadFresh = lastWriteUtc.HasValue
            && DateTime.UtcNow - lastWriteUtc.Value < TimeSpan.FromSeconds(5);
        return mustReadFresh ? _primary : _replica;
    }
}`
          }
        ]
      },
      {
        id: "3.3",
        title: "Partitioning",
        blocks: [
          {
            type: "text",
            text: "Partition when: one machine can't hold the data or handle the writes."
          },
          {
            type: "text",
            text: "Range-based: good for range queries, bad for hotspots. Hash-based: even spread, kills range queries."
          },
          {
            type: "say",
            text: "I'd avoid partitioning until the real hotspot is proven. It adds routing, rebalancing, and cross-partition query complexity."
          }
        ]
      },
      {
        id: "3.4",
        title: "The Outbox Pattern — Most Practical DDIA Takeaway",
        blocks: [
          {
            type: "text",
            text: "Problem: writing to DB and publishing to a broker as two separate actions means one can succeed while the other fails."
          },
          {
            type: "text",
            text: "Solution: save the entity AND the outbox message in one database transaction. A background worker publishes from the outbox."
          },
          {
            type: "code",
            lang: "csharp",
            label: "Atomic Write — Order + Outbox in One Transaction",
            code: `public async Task PlaceOrderAsync(Order order, CancellationToken ct)
{
    await using var db = new OrderDbContext(_options);
    await using var tx = await db.Database.BeginTransactionAsync(ct);

    db.Orders.Add(order);
    db.OutboxMessages.Add(new OutboxMessage
    {
        Type = "OrderPlaced",
        PayloadJson = JsonSerializer.Serialize(new
        {
            order.Id, order.CustomerId, order.TotalAmount, order.CreatedAtUtc
        })
    });

    await db.SaveChangesAsync(ct);
    await tx.CommitAsync(ct);
}`
          },
          {
            type: "code",
            lang: "csharp",
            label: "Background Publisher",
            code: `public sealed class OutboxPublisher : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = _sf.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();

            var batch = await db.OutboxMessages
                .Where(x => x.PublishedAtUtc == null)
                .OrderBy(x => x.OccurredAtUtc)
                .Take(100)
                .ToListAsync(ct);

            foreach (var msg in batch)
            {
                await _bus.PublishAsync(msg.Type, msg.PayloadJson, ct);
                msg.PublishedAtUtc = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromSeconds(1), ct);
        }
    }
}`
          },
          {
            type: "say",
            text: "I'd rather use a local transaction plus outbox plus idempotent consumers than distributed transactions. Simpler, more robust, no cross-system commit coupling."
          },
          {
            type: "radwork",
            text: "Write truth in one DB. Read replicas for low-risk views only. Outbox for notifications and search updates. Partition only after you understand whether hotspots are by tenant, site, modality, or time window."
          }
        ]
      }
    ],
    lab: [
      "Add the outbox table and write one outbox record per order creation",
      "Implement the background publisher (BackgroundService)",
      "Add read-routing that routes to primary for 5 seconds after a write",
      "Choose a partition key for orders and defend it"
    ],
    claudePrompts: [
      "Give me 5 user-facing bugs caused by replication lag in an order or worklist system. For each, show the architectural cause and one mitigation.",
      "Help me choose a partition key for an orders table. My queries are: get order by ID, get orders for customer, get recent orders for ops. Show trade-offs for each candidate.",
      "Explain the outbox pattern like I'm in an interview. Then explain why it beats naive DB-write + broker-publish logic. Use .NET BackgroundService in the example."
    ],
    quiz: [
      { q: "What problem do replicas solve well?", a: "Read scaling and availability." },
      { q: "What new problem do replicas introduce?", a: "Replication lag → stale-read semantics." },
      { q: "When is partitioning usually not worth it yet?", a: "When one machine can handle the load and there's no proven hotspot." },
      { q: "Why is dual write dangerous?", a: "One write can succeed while the other fails → inconsistency." },
      { q: "What does the outbox pattern buy you?", a: "Atomic persistence of data AND intent to publish." }
    ],
    speakDrill: { minutes: 3, topics: ["Leader-based replication", "One real stale-read bug", "Why outbox is safer than dual write"] }
  },

  {
    id: 4,
    title: "Transactions, Isolation, Idempotency & Correctness",
    shortTitle: "Day 4",
    chapters: "Chapter 7",
    theme: "Concurrency and correctness",
    duration: "6–8 hours",
    interviewerTesting: "Whether you can protect business invariants under concurrency. This is where 'two users buy the last item' enters like a final boss.",
    outcome: "Explain ACID precisely, distinguish isolation levels by behavior, prevent concurrency bugs, and treat idempotency as part of correctness.",
    sections: [
      {
        id: "4.1",
        title: "ACID",
        blocks: [
          {
            type: "list",
            items: [
              "Atomicity — all or nothing",
              "Consistency — your invariants stay true (YOUR job, not the database's)",
              "Isolation — concurrent transactions don't expose broken intermediate state",
              "Durability — committed data survives crashes"
            ]
          }
        ]
      },
      {
        id: "4.2",
        title: "Race Conditions — Know These Cold",
        blocks: [
          {
            type: "table",
            headers: ["Anomaly", "What Happens", "Fix"],
            rows: [
              ["Dirty read", "Read uncommitted data", "Read Committed"],
              ["Lost update", "Two read-modify-writes, one silently overwrites", "Atomic ops or CAS"],
              ["Write skew", "Two txns read condition, both write, constraint violated", "Serializable"],
              ["Phantom", "Query matches new rows from concurrent insert", "Serializable + index-range locks"]
            ]
          },
          {
            type: "subheading",
            text: "Write Skew — The Interview Differentiator"
          },
          {
            type: "callout",
            text: "Radiologist A checks 'study CT-1234 is unassigned' → true\nRadiologist B checks 'study CT-1234 is unassigned' → true\nA assigns CT-1234 → succeeds\nB assigns CT-1234 → also succeeds\nResult: two radiologists own the same study.\n\nUnder snapshot isolation, BOTH see 'unassigned' from their snapshot.\nFix: SELECT ... FOR UPDATE, or serializable isolation, or atomic conditional UPDATE."
          }
        ]
      },
      {
        id: "4.3",
        title: "Prevent Overselling — Three Patterns",
        blocks: [
          {
            type: "code",
            lang: "csharp",
            label: "Pattern 1: Atomic Conditional Update (Best)",
            code: `public async Task<bool> ReserveStockAsync(string productId, int qty, CancellationToken ct)
{
    const string sql = """
        UPDATE products SET stock_quantity = stock_quantity - @qty
        WHERE id = @productId AND stock_quantity >= @qty;
        """;

    await using var conn = new NpgsqlConnection(_connStr);
    var affected = await conn.ExecuteAsync(
        new CommandDefinition(sql, new { productId, qty }, cancellationToken: ct));
    return affected == 1;
    // Collapses read-check-write into one atomic statement.
}`
          },
          {
            type: "text",
            text: "Pattern 2: SELECT FOR UPDATE — lock the row, then decide.\nPattern 3: Serializable + retry — when invariant spans complex conditions."
          },
          {
            type: "say",
            text: "I prefer to reason from the business invariant backward. If a weaker tool can protect it — unique constraint, atomic update, optimistic concurrency — I use that. I reach for serializable only when the invariant truly needs it."
          }
        ]
      },
      {
        id: "4.4",
        title: "Optimistic Concurrency & Idempotency Keys",
        blocks: [
          {
            type: "code",
            lang: "csharp",
            label: "Optimistic Concurrency in EF Core",
            code: `public sealed class PaymentAttempt
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Status { get; set; } = "";
    [Timestamp] public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
// Two writers race → one gets DbUpdateConcurrencyException.
// Better than silent corruption.`
          },
          {
            type: "subheading",
            text: "Idempotency Keys"
          },
          {
            type: "text",
            text: "Retries happen because: clients retry, proxies retry, workers retry, humans click twice, networks fail at the rudest moment. Any externally visible write that may be retried needs an idempotency story."
          },
          {
            type: "code",
            lang: "csharp",
            label: "Idempotency Key Pattern",
            code: `public sealed class ProcessedRequest
{
    public string IdempotencyKey { get; set; } = "";
    public string ResponseJson { get; set; } = "";
    public DateTime ProcessedAtUtc { get; set; }
}

// On each request:
// 1. Check if idempotency key exists → return cached response
// 2. If not → execute once, persist result + key atomically
// 3. Retries return the same outcome safely

// Exactly-once is often marketing. Idempotent processing is engineering.`
          },
          {
            type: "radwork",
            text: "Exclusive claim/assignment = same concurrency class as stock reservation. Duplicate notifications = idempotency / processed-message tracking. Billing transitions = local transaction first, async propagation later."
          }
        ]
      }
    ],
    lab: [
      "Simulate two concurrent purchases of the last item — watch it oversell",
      "Fix it with atomic conditional update",
      "Add an idempotency-key table for POST /orders",
      "Retry the same request and verify same outcome"
    ],
    claudePrompts: [
      "Give me 3 realistic concurrency bugs in an order system besides overselling. For each, tell me the invariant being violated and the simplest fix.",
      "Act like an interviewer and challenge my choice of isolation level. Force me to justify weaker vs stronger isolation using a concrete business invariant.",
      "Explain idempotency keys, optimistic concurrency, and serializable transactions as three different tools for correctness. Compare them cleanly for an interview answer."
    ],
    quiz: [
      { q: "Is consistency solely the database's job?", a: "No. The database helps, but business rules must be correctly designed." },
      { q: "What's the simplest safe pattern for 'decrement stock only if enough remains'?", a: "Atomic conditional UPDATE with WHERE clause." },
      { q: "Why are retries dangerous without idempotency?", a: "'Retry' becomes 'duplicate business side effect.'" },
      { q: "When is optimistic concurrency useful?", a: "When contention is manageable and conflicts can be retried." },
      { q: "When would serializable be worth the cost?", a: "When the invariant spans complex multi-row conditions." }
    ],
    speakDrill: { minutes: 3, topics: ["Atomic conditional update", "SELECT FOR UPDATE", "Idempotency keys"] }
  },

  {
    id: 5,
    title: "Distributed Systems Reality, Consistency & Consensus",
    shortTitle: "Day 5",
    chapters: "Chapters 8–9",
    theme: "Separates shallow from strong",
    duration: "6–8 hours",
    interviewerTesting: "Whether you understand that networks, clocks, and processes are all liars.",
    outcome: "Explain why distributed systems are hard even when code looks fine, distinguish eventual consistency / linearizability / serializability, explain CAP correctly, and know when consensus is needed vs overkill.",
    sections: [
      {
        id: "5.1",
        title: "The Three Realities",
        blocks: [
          {
            type: "text",
            text: "Networks are unreliable. No response? You don't know if the node died, the request died, the response died, or the network paused. You only know: you are uncertain."
          },
          {
            type: "text",
            text: "Clocks lie. Wall clocks jump, drift, disagree. Never build important correctness around 'newest timestamp wins.'"
          },
          {
            type: "code",
            lang: "csharp",
            label: "Dangerous Clock-Based Merge (Don't Do This)",
            code: `// DANGEROUS — do not use for important conflict resolution
public static Order Merge(Order left, Order right)
{
    return left.UpdatedAtUtc >= right.UpdatedAtUtc ? left : right;
}
// If clocks drift between nodes, you silently lose the correct write.
// Use version numbers or fencing tokens instead.`
          },
          {
            type: "text",
            text: "Processes pause. GC, OS scheduling, resource contention. A process can look alive to itself and dead to the rest of the world."
          },
          {
            type: "interview-quote",
            text: "In a distributed system, you cannot distinguish between a slow node and a dead node. That single fact is the root of most distributed systems problems."
          }
        ]
      },
      {
        id: "5.2",
        title: "Consistency Words People Confuse",
        blocks: [
          {
            type: "table",
            headers: ["Term", "Meaning"],
            rows: [
              ["Eventual consistency", "Replicas converge over time if writes stop"],
              ["Linearizability", "Appears as one copy, real-time order. Very strong. Expensive."],
              ["Serializability", "Concurrent transactions behave as-if-serial. About tx correctness."]
            ]
          },
          {
            type: "say",
            text: "Linearizability is about single-object real-time visibility. Serializability is about multi-operation transactional correctness. They are different guarantees."
          }
        ]
      },
      {
        id: "5.3",
        title: "CAP — Stated Correctly",
        blocks: [
          {
            type: "text",
            text: "Not 'pick two.' Correct:"
          },
          {
            type: "interview-quote",
            text: "During a network partition, you must choose whether to preserve consistency or availability for the affected operations."
          },
          {
            type: "text",
            text: "Less catchy. Far more useful."
          }
        ]
      },
      {
        id: "5.4",
        title: "Fencing Tokens — Fix for Zombie Locks",
        blocks: [
          {
            type: "text",
            text: "A lock expires while the holder is GC-paused. A second actor acquires the lock. The first wakes up and writes stale data. Fix: each lock acquisition gets a monotonically increasing token. The storage layer rejects writes from stale tokens."
          },
          {
            type: "code",
            lang: "csharp",
            label: "Fenced Write Gate",
            code: `public sealed class FencedWriteGate
{
    private long _lastAcceptedToken;
    private readonly object _sync = new();

    public bool TryAccept(long fenceToken)
    {
        lock (_sync)
        {
            if (fenceToken <= _lastAcceptedToken) return false;
            _lastAcceptedToken = fenceToken;
            return true;
        }
    }
}`
          },
          {
            type: "say",
            text: "Consensus is for making one safe decision under failure. I'd avoid implementing it myself and rely on a proven system. I also try to reduce the need for coordination rather than romanticize it."
          },
          {
            type: "radwork",
            text: "Strong: unique accession, exclusive claim, no duplicate irreversible action. Eventually consistent: search, analytics, dashboards, cache, notification history."
          }
        ]
      },
      {
        id: "5.5",
        title: "Practical Consistency Decisions",
        blocks: [
          {
            type: "text",
            text: "The key question is not 'can we make everything strongly consistent?' but 'which invariants actually require it?'"
          },
          {
            type: "table",
            headers: ["Needs Strong Consistency", "Can Be Eventually Consistent"],
            rows: [
              ["Unique order ID / idempotency key", "Search index"],
              ["Stock reservation (no oversell)", "Analytics dashboard"],
              ["Payment dedup (no double charge)", "Redis cache"],
              ["", "Recommendation data"]
            ]
          }
        ]
      }
    ],
    lab: [
      "Simulate a Redis lock with TTL expiry",
      "Add a 'long pause' and show why naive lock semantics fail",
      "Add a fencing-token check",
      "Write one paragraph on whether OrderFlow's search index should be linearizable"
    ],
    claudePrompts: [
      "Explain eventual consistency, linearizability, and serializability using one order-processing example. Then tell me which guarantee I likely need for checkout, search, and analytics.",
      "Act as an interviewer and ask me CAP theorem questions, but force me to state CAP correctly instead of using the slogan version.",
      "Explain why timestamps are dangerous for ordering or conflict resolution in distributed systems. Give me one bad design and one safer alternative using .NET examples."
    ],
    quiz: [
      { q: "Can you reliably distinguish a dead node from a very slow one?", a: "No." },
      { q: "Is linearizability the same as serializability?", a: "No. Linearizability = real-time visibility. Serializability = transaction correctness." },
      { q: "What does CAP say during a partition?", a: "Choose consistency or availability for affected operations." },
      { q: "Why can naive distributed locks fail?", a: "Lock expires during a pause; zombie holder wakes up and writes stale data." },
      { q: "What things usually do NOT need strong consistency?", a: "Search indexes, caches, analytics dashboards, non-critical read projections." }
    ],
    speakDrill: { minutes: 3, topics: ["Why clocks lie", "CAP stated correctly", "Why search can usually be eventually consistent"] }
  },

  {
    id: 6,
    title: "Batch, Streams, CDC, Event Sourcing & Derived Data",
    shortTitle: "Day 6",
    chapters: "Chapters 10–11",
    theme: "Modern dataflow architecture",
    duration: "6–8 hours",
    interviewerTesting: "Whether you understand modern dataflow architecture and can avoid cross-service transaction traps.",
    outcome: "Explain batch vs streaming, CDC vs event sourcing, why derived data is normal, and why outbox + idempotent consumers is the practical sweet spot.",
    sections: [
      {
        id: "6.1",
        title: "Batch vs Streaming",
        blocks: [
          {
            type: "text",
            text: "Batch: Map → group/shuffle → reduce. Still useful: easier to reason about, replayable, perfect for rebuilding projections."
          },
          {
            type: "say",
            text: "I'd use streams when the system benefits from continuous propagation, but I still want replay, observability, and idempotent consumers so the architecture stays recoverable."
          }
        ]
      },
      {
        id: "6.2",
        title: "CDC vs Event Sourcing",
        blocks: [
          {
            type: "text",
            text: "CDC: source of truth is current DB state. Change stream derived from mutations. Easier to adopt incrementally."
          },
          {
            type: "text",
            text: "Event Sourcing: source of truth is the event log. State is reconstructed. Strong audit power. Higher conceptual cost."
          },
          {
            type: "say",
            text: "I'd prefer CDC or outbox-driven integration unless the domain strongly benefits from event sourcing. Event sourcing is powerful, but I don't reach for it just because events sound modern."
          }
        ]
      },
      {
        id: "6.3",
        title: "Derived Data Is Everywhere",
        blocks: [
          {
            type: "text",
            text: "Cache, search index, read model, analytics table, dashboard — all derived. Normal. The question: what is the source of truth, and how do derived views stay recoverable?"
          }
        ]
      },
      {
        id: "6.4",
        title: "Cache-Aside Pattern",
        blocks: [
          {
            type: "code",
            lang: "csharp",
            label: "Cache-Aside for OrderFlow",
            code: `public async Task<IReadOnlyList<OrderRow>> GetRecentOrdersAsync(
    string customerId, CancellationToken ct)
{
    var cacheKey = $"orders:{customerId}";
    var cached = await _cache.GetStringAsync(cacheKey, ct);

    if (cached is not null)
        return JsonSerializer.Deserialize<List<OrderRow>>(cached)!;

    var results = await _db.Orders
        .Where(x => x.CustomerId == customerId)
        .OrderByDescending(x => x.CreatedAtUtc)
        .Take(20)
        .Select(x => new OrderRow(x.Id, x.CustomerId, x.TotalAmount,
            x.Status, x.CreatedAtUtc))
        .ToListAsync(ct);

    await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(results),
        new DistributedCacheEntryOptions
        { AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30) }, ct);

    return results;
}`
          }
        ]
      },
      {
        id: "6.5",
        title: "Idempotent Projection Consumer",
        blocks: [
          {
            type: "code",
            lang: "csharp",
            label: "Rebuildable Search Projection",
            code: `public sealed class OrderSearchProjection
{
    public async Task HandleAsync(OrderPlacedEvent msg, CancellationToken ct)
    {
        var exists = await _db.OrderSummaries
            .AnyAsync(x => x.OrderId == msg.OrderId, ct);
        if (exists) return; // Idempotent

        _db.OrderSummaries.Add(new OrderSummary
        {
            OrderId = msg.OrderId,
            CustomerId = msg.CustomerId,
            TotalAmount = msg.TotalAmount,
            CreatedAtUtc = msg.CreatedAtUtc,
            SearchText = $"{msg.CustomerId} {msg.OrderId}"
        });

        await _db.SaveChangesAsync(ct);
    }
}
// A projection is allowed to lag.
// It is NOT allowed to become mysterious.
// Make it rebuildable. Make it observable. Make it idempotent.`
          },
          {
            type: "radwork",
            text: "Worklist search = derived read model. Critical finding notifications = event-driven flow. Analytics = batch or stream projection off the transactional source."
          }
        ]
      }
    ],
    lab: [
      "Add an order_summaries table",
      "When an order is placed, emit an outbox message",
      "A worker consumes the message and populates the summary",
      "Re-run the same message and prove handling is idempotent",
      "Explain how you would rebuild the projection from scratch"
    ],
    claudePrompts: [
      "Compare batch processing, stream processing, CDC, and event sourcing for an order system. Give me the answer in interview language, not vendor language.",
      "I want to keep a search index and analytics tables in sync with my main PostgreSQL database. Walk me through a practical design using outbox or CDC and tell me what can go wrong.",
      "Challenge my architecture: I'm about to use event sourcing. Ask me whether I truly need it or whether outbox + projections is enough."
    ],
    quiz: [
      { q: "Is derived data suspicious or normal?", a: "Normal. Search, cache, analytics are all derived." },
      { q: "What is the source of truth in CDC?", a: "The current database state." },
      { q: "What is the source of truth in event sourcing?", a: "The event log itself." },
      { q: "Why is idempotent consumption important?", a: "Because retries and redeliveries are normal in async systems." },
      { q: "Why is rebuildability valuable?", a: "Recovery from bugs, backfills, schema evolution, operational confidence." }
    ],
    speakDrill: { minutes: 3, topics: ["CDC vs event sourcing", "Why derived data is normal", "Why rebuildability is architectural leverage"] }
  },

  {
    id: 7,
    title: "Interview Synthesis, Capstone & Final Review",
    shortTitle: "Day 7",
    chapters: "Chapter 12 + Synthesis",
    theme: "Turns knowledge into performance",
    duration: "6–8 hours",
    interviewerTesting: "Whether you can tie it all together into a coherent, defensible architecture under pressure.",
    outcome: "Give a clean 30–45 minute system-design answer. Choose trade-offs intentionally. Defend a staged evolution path. Recognize your weak areas before the interviewer does.",
    sections: [
      {
        id: "7.1",
        title: "The Capstone Answer",
        blocks: [
          {
            type: "interview-quote",
            text: "I'd start OrderFlow as a modular monolith with PostgreSQL as the source of truth because the workflow has strong entity relationships and correctness requirements. The write path stays transactional and local. For hot reads, Redis selectively. For search and analytics, derived state populated asynchronously via outbox-driven events.\n\nIf read scale grows, I'd add replicas and define stale-read semantics explicitly. Partitioning comes only after the real hotspot is proven.\n\nFor correctness: atomic conditional updates, optimistic concurrency, idempotency keys. No distributed transactions — local transaction + outbox + idempotent consumers.\n\nStrong consistency reserved for business invariants. Search, cache, analytics can be eventually consistent."
          },
          {
            type: "text",
            text: "If you can say this calmly and defend every sentence, you are in good shape."
          }
        ]
      },
      {
        id: "7.2",
        title: "The 45-Minute Interview Framework",
        blocks: [
          {
            type: "numbered-list",
            items: [
              "Minutes 0–5: Clarify. Scale assumptions, write/read ratio, latency goals, consistency expectations, failure concerns.",
              "Minutes 5–10: Core model. Main entities, source of truth, critical write path, top read paths.",
              "Minutes 10–20: First version. Simplest thing that works — monolith, PostgreSQL, API shape, indexes, local transactions.",
              "Minutes 20–30: Evolution. Add only what is justified — cache, search projection, replicas, outbox/broker, worker processing.",
              "Minutes 30–40: Correctness and consistency. Duplicate requests, concurrent writes, stale reads, crash recovery.",
              "Minutes 40–45: Risks and trade-offs. What you chose NOT to build. What could fail. What you'd monitor."
            ]
          }
        ]
      },
      {
        id: "7.3",
        title: "Follow-Up Traps Interviewers Love",
        blocks: [
          {
            type: "table",
            headers: ["Question", "Strong Answer"],
            rows: [
              ["Why not microservices immediately?", "I want local correctness, simpler ops, and lower coordination cost until boundaries earn their network hop."],
              ["Why not shard immediately?", "Sharding adds routing, rebalancing, and cross-partition pain. I only pay that cost once the real hotspot is proven."],
              ["Why not make everything strongly consistent?", "Strong consistency everywhere increases coupling, latency, and coordination cost. I reserve it for business invariants."],
              ["Why not event-source the whole thing?", "The domain may not justify the complexity. Outbox + projections is often enough."],
              ["What if the broker is down?", "The core local transaction still succeeds. Outbox messages remain pending and publish later."],
              ["What if the user retries the same payment?", "Idempotency key catches it. Same result returned, no duplicate charge."]
            ]
          }
        ]
      },
      {
        id: "7.4",
        title: "Final Drills",
        blocks: [
          {
            type: "numbered-list",
            items: [
              "Drill 1 (2 min): Explain why not everything needs strong consistency.",
              "Drill 2 (5 min): Design OrderFlow for Black Friday traffic.",
              "Drill 3 (10 min): Defend outbox + idempotent consumers against distributed transactions.",
              "Drill 4 — Red-team yourself: Where can stale data appear? Duplicates? What if the publisher crashes after DB commit but before publish? What if search lags 10 minutes? What if one tenant becomes a hotspot?"
            ]
          },
          {
            type: "radwork",
            text: "Take any OrderFlow answer and restate it for a healthcare worklist system: order → study/work item, stock reservation → exclusive claim, search index → worklist projection, analytics → turnaround-time dashboard."
          }
        ]
      }
    ],
    lab: [
      "Give a full 30-min system design answer out loud — record yourself",
      "Identify 3 weak spots from your answer and review those days",
      "Run a mock interview with Claude using the Mega Prompt",
      "Complete the Failure-First Review on your design"
    ],
    claudePrompts: [
      "Run a full 45-minute mock system design interview for a data-intensive .NET backend role. Use OrderFlow as the domain. Push me on consistency, transactions, replication lag, partitioning, outbox, idempotency, and derived data.",
      "I will paste my system design answer. Grade it on: clarity, trade-off awareness, correctness, practical .NET implementation, evolution strategy. Rewrite only the weakest parts.",
      "Act as a principal engineer and attack my design. Focus on hidden assumptions, stale reads, duplicate handling, operational recovery, and where I'm paying too much complexity too early."
    ],
    quiz: [
      { q: "What should you clarify in the first 5 minutes of a system design interview?", a: "Scale assumptions, write/read ratio, latency goals, consistency expectations, failure concerns, region/tenant assumptions." },
      { q: "Why start with a monolith before microservices?", a: "Local transactions, simpler ops, lower coordination cost until service boundaries are proven." },
      { q: "What is the key question about consistency?", a: "Not 'can we make everything strongly consistent?' but 'which invariants actually require it?'" },
      { q: "What happens to the outbox when the broker is down?", a: "Messages remain pending in the DB. Core transaction succeeded. Derived state lags but source-of-truth is preserved." },
      { q: "When should you partition?", a: "Only after the real hotspot is proven. Not speculatively." }
    ],
    speakDrill: { minutes: 5, topics: ["The full capstone OrderFlow answer", "Three follow-up traps and your answers", "Failure-first: five questions about your design"] }
  }
]

export const MEMORY_MAP = [
  { term: "RELIABILITY", desc: "Fault ≠ failure. Design fault tolerance. Expect human > software > hardware faults." },
  { term: "SCALABILITY", desc: "Define load parameters. Percentiles, not averages. Replicas scale reads. Partition only when proven." },
  { term: "MAINTAINABILITY", desc: "Operability + simplicity + evolvability. Modular monolith first." },
  { term: "DATA MODELS", desc: "Relational for relationships and invariants. Document/JSONB for flexible shapes." },
  { term: "STORAGE", desc: "B-tree: predictable reads, relational default. LSM: write-heavy. Indexes follow queries." },
  { term: "OLTP vs OLAP", desc: "Separate transactional and analytical workloads. Star schema for analytics." },
  { term: "SCHEMA EVOLUTION", desc: "Old and new code coexist. Add safely. Backfill. Tighten later." },
  { term: "REPLICATION", desc: "Replicas: reads + availability. Lag creates stale-read semantics. Route freshness-sensitive reads to primary." },
  { term: "PARTITIONING", desc: "Solves scale limits. Creates routing + rebalancing + cross-partition complexity. Last responsible moment." },
  { term: "TRANSACTIONS", desc: "Weakest isolation that protects the invariant. Atomic updates > locks > serializable." },
  { term: "IDEMPOTENCY", desc: "Retries happen. Design for them. Every retriable write needs an idempotency story." },
  { term: "OUTBOX", desc: "Local tx + outbox + idempotent consumers > distributed transactions. Always." },
  { term: "DISTRIBUTED", desc: "Networks, clocks, processes lie. CAP applies during partitions. Fencing tokens > naive locks." },
  { term: "CONSISTENCY", desc: "Eventual ≠ linearizable ≠ serializable. Strong consistency only where invariants demand it." },
  { term: "DERIVED DATA", desc: "Cache, search, analytics are derived. Source of truth is clear. Projections are rebuildable." },
]

export const INTERVIEW_QUESTIONS = [
  "What does scalability mean, exactly?",
  "Why is p99 latency important?",
  "Relational vs document database: how do you choose?",
  "Why are joins not automatically bad?",
  "What is denormalization and what does it cost?",
  "Why does schema evolution matter in distributed systems?",
  "What is the difference between OLTP and OLAP?",
  "What is an index really buying you?",
  "B-tree vs LSM-tree at a high level?",
  "Why replicate data?",
  "What user-facing bugs can replication lag create?",
  "Single leader vs multi-leader vs leaderless?",
  "What makes a good partition key?",
  "What is a hotspot?",
  "Why are transactions useful?",
  "What anomaly is a lost update?",
  "What does serializable isolation mean?",
  "Why does idempotency matter?",
  "Why are timeouts ambiguous?",
  "Eventual consistency vs linearizability vs serializability?",
  "What is consensus for?",
  "Why avoid distributed transactions when possible?",
  "What is derived data?",
  "CDC vs event sourcing?",
  "Describe a practical architecture for a scalable, reliable .NET system."
]

export const STRONGER_ANSWERS = [
  "Scale with respect to what load parameter?",
  "What user-visible semantics do we need after a write?",
  "That view is derived state, so I'd make it rebuildable.",
  "I'd keep the source of truth simple first.",
  "I'd avoid paying for cross-service coordination unless the invariant requires it.",
  "That sounds like a stale-read problem, not just an infra problem.",
  "I'd rather use a local transaction and outbox than distributed ACID.",
  "The right partition key depends on query shape and hotspot risk.",
  "I care more about p95/p99 than average latency.",
  "I'd choose the simplest architecture that preserves correctness and can evolve."
]

export const ONE_DAY_TOPICS = [
  "Reliability / scalability / maintainability",
  "Relational vs document",
  "Indexes, OLTP vs OLAP",
  "Replication lag",
  "Partitioning and hotspots",
  "Transactions and anomalies (lost update, write skew)",
  "Idempotency",
  "Eventual consistency vs linearizability vs serializability",
  "Outbox pattern",
  "Derived state"
]

export const MEGA_PROMPT = `Act as a principal software architect coaching a mid-level .NET backend engineer for technical interviews.

Use DDIA mental models: reliability, scalability, maintainability, data-model choice, storage/index trade-offs, replication, partitioning, transactions, distributed failure modes, consistency/consensus, streams, derived data.

Rules:
1. Be practical, not academic.
2. Use OrderFlow (e-commerce) as the interview example and RadWork (medical imaging worklist) for production transfer.
3. Translate every concept into what I should say in an interview.
4. Give .NET examples: ASP.NET Core, EF Core, Dapper, PostgreSQL, Redis, brokers, BackgroundService.
5. Push back whenever I say something vague.
6. After each explanation, ask me one question to test understanding.
7. Point out where I am over-engineering.
8. Help me separate source-of-truth data from derived state.
9. Help me explain trade-offs clearly.
10. Keep me focused on what matters most for interviews.

Start by asking me 5 diagnostic questions, then coach me based on my weak spots.`
