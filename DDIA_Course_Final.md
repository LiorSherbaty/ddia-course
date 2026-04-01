# DDIA Interview-Ready Course v4
## A 7-Day Architect-Level Study Plan for a Mid-Level .NET Engineer

> **Goal:** learn the parts of *Designing Data-Intensive Applications* that matter most in technical interviews, in a way that also improves your real architecture judgment.
>
> **Format:** 7 days × 6–8 hours
> **Running example:** **OrderFlow** — a .NET 8 e-commerce order system
> **Transfer bridge:** every day includes **"How this maps to RadWork / healthcare-style systems"** so the ideas stay relevant to the kind of systems you actually build.

---

## What this course is

Not a chapter-by-chapter retelling. It is the **compressed interview version**:
- the ideas you are most likely to need in system-design interviews
- the mental models that help you reason under pressure
- the trade-offs you should be able to explain out loud
- production .NET examples so the ideas stick

## What I intentionally cut

- deep graph database / Datalog theory
- Hadoop / MapReduce plumbing
- consensus algorithm internals beyond what you need to reason
- building toy engines (LSM, consistent hash ring) from scratch
- anything unlikely to appear unless you interview for databases or infra

---

## The one rule for using this course

Do not just read it.

Every day:
1. Read the concepts
2. Run or sketch the code
3. Use the prompts with Claude/ChatGPT
4. **Explain the idea out loud without notes**
5. Do the exercises and quiz
6. End with the "speak it out loud" drill

If you skip steps 3–6, you will feel smart and still freeze in the interview.

---

## Golden rules for interviews

Use this pattern when you answer:

1. **State the problem clearly**
2. **Name the trade-off**
3. **Choose based on workload or failure mode**
4. **Say what you'd build first**
5. **Say what can go wrong**
6. **Say how you'd evolve it later**

### Strong answer pattern

> "I'd start with PostgreSQL because the core workflow needs transactional correctness and clear relationships. If reads become hot, I'd add Redis for hot paths and a search index as derived state. I would avoid distributed transactions and use outbox + idempotent consumers for cross-boundary updates. If traffic grows further, I'd add read replicas first, then partition only after I know the actual hotspot."

That answer sounds senior because it is grounded.

---

## Environment setup (Day 0)

```bash
# PostgreSQL 16
docker run -d --name orderflow-pg \
  -e POSTGRES_PASSWORD=orderflow -e POSTGRES_DB=orderflow \
  -p 5432:5432 postgres:16

# Redis 7
docker run -d --name orderflow-redis -p 6379:6379 redis:7

# Kafka (for Day 6–7)
docker run -d --name orderflow-kafka \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@localhost:9093 \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -p 9092:9092 bitnami/kafka:latest

# .NET project
dotnet new webapi -n OrderFlow && cd OrderFlow
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add package StackExchange.Redis
dotnet add package Dapper
dotnet add package Polly
dotnet add package Confluent.Kafka

# Verify
docker exec -it orderflow-pg psql -U postgres -d orderflow -c "SELECT 1;"
docker exec -it orderflow-redis redis-cli PING
```

---

## Week overview

| Day | DDIA Chapters | Theme | Interview value |
|---|---|---|---|
| 1 | 1–2 | Reliability, scalability, maintainability, data models | The language of good answers |
| 2 | 3–4 | Storage engines, indexing, OLTP vs OLAP, schema evolution | Explain performance and safe change |
| 3 | 5–6 | Replication and partitioning | Core scaling and stale-read territory |
| 4 | 7 | Transactions, isolation, idempotency | Concurrency and correctness |
| 5 | 8–9 | Distributed systems, consistency, consensus | Separates shallow from strong |
| 6 | 10–11 | Batch, streams, CDC, event sourcing, derived data | Modern dataflow architecture |
| 7 | 12 + synthesis | Full system design, capstone, mock interview | Turns knowledge into performance |


## Daily execution template (use this every day)

A practical 6–8 hour rhythm that keeps the material sticky instead of decorative:

- **90 minutes** — read the day and rewrite the ideas in your own words
- **90 minutes** — run the SQL / code / lab work
- **60 minutes** — explain the topic out loud without notes
- **60 minutes** — use the prompts with ChatGPT or Claude and tighten weak answers
- **90 minutes** — do the exercises, quiz, and one red-team scenario
- **30–60 minutes** — write your personal notes using the template at the end

## Modern .NET defaults for this whole course

These are the defaults I would keep in my head while studying and while answering in interviews:

- **ASP.NET Core** for explicit HTTP APIs and background workers
- **PostgreSQL** as the system of record unless the workload proves otherwise
- **EF Core** on the write side, **Dapper or focused queries** on hot reads
- **Redis** for hot-path caching, never as the truth store
- **BackgroundService** for outbox publishing and projection workers
- **OpenTelemetry + structured logging** for latency, traces, and failure visibility
- **JSONB** for flexible substructures when relational core + variable attributes is the right mix
- **Idempotency + retry awareness** on any write that can be replayed

These defaults are not religion. They are a strong starting point.

---

## Running example: OrderFlow

An order-processing platform that evolves from a modular monolith to a distributed, event-driven system across the week.

**Core modules:** Orders, Inventory, Payments, Shipping, Product Catalog, Search/Read Models, Analytics.

### How OrderFlow maps to RadWork / healthcare systems

| OrderFlow | RadWork Equivalent |
|---|---|
| Order | Study / work item |
| Inventory / stock reservation | Resource availability / exclusive claim |
| Payment | External irreversible workflow / billable step |
| Product catalog | Modality and vendor metadata |
| Search / worklist | Worklist filtering by site, urgency, status |
| Analytics | Turnaround-time dashboards |
| Notifications | Critical AI finding alerts |

Use OrderFlow for interview muscle memory. Use RadWork for real intuition.

---

# Day 1 — Reliability, Scalability, Maintainability, Data Models
**⏱ 6–8 hours** | Chapters 1–2

## What interviewers are really testing

Whether you can **reason before you prescribe**. Weak candidates jump to tools. Strong candidates talk about failure modes, load shape, consistency needs, and why the simplest architecture is usually correct today.

## Outcome

Define reliability, scalability, and maintainability precisely. Explain why averages lie. Choose between relational and document modeling. Answer "how would you start?" without sounding like a tool salesman.

---

## 1.1 Reliability

**Interview sentence:**

> "A fault is one component misbehaving. A failure is the system no longer delivering required service. Good architecture stops local faults from becoming visible failures."

Three fault sources, ranked by actual outage frequency:
1. **Human error** — bad config, bad deploy (#1 cause)
2. **Software bugs** — cascading failures, resource leaks
3. **Hardware** — disk failure, NIC death

Practical patterns: retries with limits, timeouts, health checks, gradual rollout, feature flags, redundancy, idempotency, chaos testing mindset.

## 1.2 Scalability

Scalability is not a property you "have." It is always: *"scalable with respect to which load parameter?"*

**OrderFlow load parameters:** orders/sec, product reads/sec, checkout concurrency, data volume, write/read ratio, fan-out per request.

### Performance is a distribution

Track p50, p95, p99, p999 — not averages. Tail latency amplification: if checkout calls 4 services in parallel and each has 1% chance of being slow, the page-level slowness probability is ~4%.

### .NET example — percentile tracker

```csharp
public sealed class LatencyTracker
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

public record LatencyReport(int Count, double P50, double P95, double P99, double P999, double Max);
```

## 1.3 Maintainability

- **Operability** — easy to run
- **Simplicity** — easy to understand
- **Evolvability** — easy to change safely

A clever design that nobody can safely modify is deferred downtime.

**Default:** start with a **modular monolith** unless a hard reason says otherwise. Simpler deployment, real local transactions, fewer network failure modes.

## 1.4 Data models

**Relational** when: entities have strong relationships, correctness matters, joins matter, constraints matter.

**Document-like** when: records are self-contained, shape varies by subtype, denormalized reads dominate.

### ✅ Say this
> "For the core write path I usually prefer relational, especially when invariants and relationships matter. I use JSONB or denormalized projections for flexible or read-heavy shapes."

### ❌ Don't say this
> "SQL is old. NoSQL is more scalable."

### OrderFlow Day 1 model

```csharp
public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CustomerId { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = new();
}

public sealed class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string ProductId { get; set; } = "";
    public string ProductName { get; set; } = "";
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public sealed class Product
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string AttributesJson { get; set; } = "{}"; // JSONB in PostgreSQL
}
```

### 🏥 RadWork transfer

Order → study/work item. Product attributes JSON → modality/vendor-specific metadata. Relational core → assignment, status, ownership, audit. Document-like projection → worklist view, search result.

---

## Mini lab

1. Create `orders`, `order_items`, `products` tables in PostgreSQL.
2. Seed 100 products.
3. Add one endpoint to create an order and one to fetch by ID.
4. Record request latencies and print p50/p95/p99.

## 🤖 Claude Prompts

```
Explain reliability, scalability, and maintainability like I'm in a system design
interview. For each, give me one good sentence I can say out loud.
```

```
I will describe a backend service and you tell me whether I'm prematurely optimizing,
under-designing, or choosing the wrong data model. Push back on every vague word.
```

## Quiz

1. Is a fault the same thing as a failure?
2. Is "scalable" meaningful without a load parameter?
3. Why is p99 often more useful than average latency?
4. When is relational modeling a better default than document?
5. Why is modular monolith often a strong starting point?

<details><summary>Answers</summary>

1. No. Fault = component deviating from spec. Failure = system failing to deliver service.
2. No. Always: scalable with respect to what?
3. Users experience tails, not averages. Composed calls amplify tails.
4. When relationships and correctness matter.
5. Local transactions, simpler deployment, fewer network failure modes.

</details>

## 🗣️ Speak it out loud (2-minute drill)

Explain: what reliability means, why averages are weak, why you'd start with PostgreSQL for OrderFlow.

If you can't say it clearly in 2 minutes, you don't know it yet.

---

# Day 2 — Storage Engines, Indexing, OLTP vs OLAP, Schema Evolution
**⏱ 6–8 hours** | Chapters 3–4

## What interviewers are really testing

Can you connect data structures to behavior? This is the day where "databases are magic" dies.

## Outcome

Explain B-tree vs LSM-tree at interview level, why a query is slow, OLTP vs OLAP, star schema for analytics, and safe schema evolution during rolling deployments.

---

## 2.1 B-tree vs LSM-tree

**B-tree** (PostgreSQL, SQL Server, MySQL): page-oriented, update in place, predictable reads. A 4-level B-tree with branching factor 500 holds 500⁴ = 62.5 billion keys — 4 disk reads to find anything.

**LSM-tree** (Cassandra, RocksDB, InfluxDB): append-oriented, buffer in memory, flush sorted runs, compact later. Great write throughput. Read amplification and compaction spikes are the trade-off.

### ✅ Say this
> "For read-heavy OLTP and rich queries I'd default to B-tree-backed PostgreSQL. For high-ingest append-heavy workloads, LSM-based systems are often better because they turn random writes into sequential writes."

### Lab: see the B-tree in action

```sql
CREATE TABLE large_orders AS
SELECT gen_random_uuid() AS id,
       'CUST-' || (random()*10000)::int AS customer_id,
       (random()*1000)::numeric(10,2) AS total_amount,
       NOW() - (random()*365 || ' days')::interval AS created_at
FROM generate_series(1, 1000000);

CREATE INDEX idx_large_orders_customer ON large_orders(customer_id);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM large_orders WHERE customer_id = 'CUST-42';
-- Read the plan. Look at buffers. Stop treating query performance as mystical.
```

## 2.2 Indexes follow access patterns

Indexes trade **more storage + slower writes** for **faster reads**. Add them for real query patterns, not vibes.

```sql
-- OrderFlow: "most recent 50 orders for one customer"
CREATE INDEX idx_orders_customer_created
ON orders(customer_id, created_at_utc DESC);
```

### Keyset pagination (interviewers notice this)

```csharp
public async Task<IReadOnlyList<OrderRow>> GetNextPageAsync(
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

public record OrderRow(Guid Id, string CustomerId, decimal TotalAmount,
    string Status, DateTime CreatedAtUtc);
```

Why this beats OFFSET: OFFSET scans and discards rows. Keyset seeks directly via the index.

## 2.3 OLTP vs OLAP

| | OLTP | OLAP |
|--|------|------|
| Queries | Point reads/writes by key | Large scans, aggregations |
| Bottleneck | Disk seeks (latency) | Disk bandwidth (throughput) |
| Storage | Row-oriented | Column-oriented |

### ✅ Say this
> "I would not let analytics workloads bully the OLTP database. If reporting becomes heavy, I'd push it into a derived analytics store."

### Star schema — the interview must-know

```sql
CREATE TABLE dim_customer (
    customer_key SERIAL PRIMARY KEY,
    customer_id VARCHAR(100), name VARCHAR(200), city VARCHAR(100), region VARCHAR(100));

CREATE TABLE dim_product (
    product_key SERIAL PRIMARY KEY,
    product_id VARCHAR(50), name VARCHAR(200), category VARCHAR(100));

CREATE TABLE dim_date (
    date_key INT PRIMARY KEY,
    full_date DATE, month INT, quarter INT, year INT, day_of_week VARCHAR(10));

CREATE TABLE fact_order_items (
    id BIGSERIAL PRIMARY KEY,
    customer_key INT REFERENCES dim_customer(customer_key),
    product_key INT REFERENCES dim_product(product_key),
    date_key INT REFERENCES dim_date(date_key),
    quantity INT, unit_price NUMERIC(10,2), total_price NUMERIC(10,2));

-- "Revenue by category by quarter" — now fast
SELECT dp.category, dd.quarter, dd.year, SUM(f.total_price) as revenue
FROM fact_order_items f
JOIN dim_product dp ON f.product_key = dp.product_key
JOIN dim_date dd ON f.date_key = dd.date_key
GROUP BY dp.category, dd.quarter, dd.year;
```

## 2.4 Safe schema evolution

Rolling deployments mean old and new code coexist. Safe changes: add nullable columns, add fields with defaults, make readers tolerant of unknown fields, backfill in phases, tighten constraints only after full rollout.

**Never** during a rolling deploy: rename, drop, or change types of existing fields.

```csharp
// V1 — shipped today
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
    public DateTime? EstimatedDeliveryUtc { get; set; }
    public string? TrackingNumber { get; set; }
}
```

### 🏥 RadWork transfer

Decide: what stays transactional in PostgreSQL, what becomes search/index projection, what reporting gets pushed out, how versioned contracts tolerate mixed deployments across services.

---

## Mini lab

1. Run `EXPLAIN ANALYZE` with and without an index. Compare buffers.
2. Compare insert speed before and after adding two indexes.
3. Implement keyset pagination with Dapper.
4. Add a nullable column safely and update the API contract.

## 🤖 Claude Prompts

```
I'm in a system design interview. Explain B-tree vs LSM-tree in 90 seconds using an
order system example. Then tell me what not to say.
```

```
I'll paste a SQL query and an index definition. Tell me whether the index matches the
query pattern, and if not, what to change.
```

```
Explain safe schema evolution during rolling deployment for a .NET API + PostgreSQL
backend. Use concrete examples, not abstract theory.
```

## Quiz

1. Why are indexes not "free"?
2. Why is OFFSET pagination painful at scale?
3. What workload fits OLAP better than OLTP?
4. Why is adding a nullable column usually safe?
5. What is a star schema's fact table?

<details><summary>Answers</summary>

1. They cost write performance and storage.
2. OFFSET scans and discards rows. Gets worse linearly.
3. Large scans and aggregations across millions of rows.
4. Old code ignores it; new code uses it with defaults.
5. The big table (millions of rows) containing metrics, with foreign keys to small dimension tables.

</details>

## 🗣️ Speak it out loud (2-minute drill)

Explain: B-tree vs LSM-tree, why the right index matters more than hype, how you'd evolve an API contract safely.

---

# Day 3 — Replication, Partitioning, and the Outbox Pattern
**⏱ 6–8 hours** | Chapters 5–6

## What interviewers are really testing

Whether you understand that scaling reads and scaling writes are different games.

## Outcome

Explain replication models, stale-read bugs, partition key trade-offs, and the outbox pattern.

---

## 3.1 Replication models (know all three)

**Single-leader**: one writer, N readers. Simple, battle-tested. PostgreSQL, MySQL, SQL Server default.

**Multi-leader**: multiple writers, conflict resolution required. Multi-region use case.

**Leaderless**: quorum (W+R>N). Higher availability. Cassandra, DynamoDB.

### ✅ Say this
> "For most systems I'd start with leader-based replication. I'd reach for multi-leader or leaderless only when the write topology truly demands it."

## 3.2 Replication lag leaks to users

| Bug | Example | Fix |
|-----|---------|-----|
| **Read-your-own-writes** | User places order, refreshes, doesn't see it | Route to primary after writes |
| **Monotonic reads** | Worklist flickers between states | Sticky sessions |
| **Consistent prefix** | AI finding appears before the study it references | Causal tracking |

### ✅ Say this
> "Replication lag is not just an infra detail. It changes what users observe. I'd decide explicitly which endpoints tolerate stale reads and which must hit the primary."

### .NET example — freshness-aware read routing

```csharp
public sealed class ReadRouter
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
}
```

## 3.3 Partitioning

Partition when: one machine can't hold the data or handle the writes.

**Range-based**: good for range queries, bad for hotspots.
**Hash-based**: even spread, kills range queries.

### ✅ Say this
> "I'd avoid partitioning until the real hotspot is proven. It adds routing, rebalancing, and cross-partition query complexity."

## 3.4 The Outbox Pattern — the backbone of reliable distributed systems

**Problem**: writing to DB and publishing to a broker as two separate actions means one can succeed while the other fails.

**Solution**: save the entity AND the outbox message in **one database transaction**. A background worker publishes from the outbox.

This pattern appears on Day 3 and stays for the rest of the course. It is the single most practical interview takeaway from DDIA.

### Outbox entity

```csharp
public sealed class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "";
    public string PayloadJson { get; set; } = "";
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAtUtc { get; set; }
}
```

### Atomic write — order + outbox in one transaction

```csharp
public async Task PlaceOrderAsync(Order order, CancellationToken ct)
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
}
```

### Background publisher — the other half

```csharp
public sealed class OutboxPublisher : BackgroundService
{
    private readonly IServiceScopeFactory _sf;
    private readonly IMessageBus _bus;
    private readonly ILogger<OutboxPublisher> _log;

    public OutboxPublisher(IServiceScopeFactory sf, IMessageBus bus, ILogger<OutboxPublisher> log)
    { _sf = sf; _bus = bus; _log = log; }

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
                try
                {
                    await _bus.PublishAsync(msg.Type, msg.PayloadJson, ct);
                    msg.PublishedAtUtc = DateTime.UtcNow;
                }
                catch (Exception ex)
                {
                    _log.LogError(ex, "Outbox publish failed for {Id}", msg.Id);
                }
            }

            await db.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromSeconds(1), ct);
        }
    }
}
```

### ✅ Interview gold
> "I'd rather use a local transaction plus outbox plus idempotent consumers than distributed transactions. Simpler, more robust, no cross-system commit coupling."

### 🏥 RadWork transfer

Write truth in one DB. Read replicas for low-risk views only. Outbox for notifications and search updates. Partition only after you understand whether hotspots are by tenant, site, modality, or time window.

---

## Mini lab

1. Add the outbox table and write one outbox record per order creation.
2. Implement the background publisher.
3. Add read-routing that routes to primary for 5 seconds after a write.
4. Choose a partition key for orders and defend it.

## 🤖 Claude Prompts

```
Give me 5 user-facing bugs caused by replication lag in an order or worklist system.
For each, show the architectural cause and one mitigation.
```

```
Help me choose a partition key for an orders table. My queries are: get order by ID,
get orders for customer, get recent orders for ops. Show trade-offs for each candidate.
```

```
Explain the outbox pattern like I'm in an interview. Then explain why it beats naive
DB-write + broker-publish logic. Use .NET BackgroundService in the example.
```

## Quiz

1. What problem do replicas solve well?
2. What new problem do replicas introduce?
3. When is partitioning usually not worth it yet?
4. Why is dual write dangerous?
5. What does the outbox pattern buy you?

<details><summary>Answers</summary>

1. Read scaling and availability.
2. Replication lag → stale-read semantics.
3. When one machine can handle the load and there's no proven hotspot.
4. One write can succeed while the other fails → inconsistency.
5. Atomic persistence of data AND intent to publish.

</details>

## 🗣️ Speak it out loud (3-minute drill)

Explain: leader-based replication, one real stale-read bug, why outbox is safer than dual write.

---

# Day 4 — Transactions, Isolation, Idempotency, Correctness
**⏱ 6–8 hours** | Chapter 7

## What interviewers are really testing

Whether you can protect business invariants under concurrency. This is where "two users buy the last item" enters like a final boss.

## Outcome

Explain ACID precisely, distinguish isolation levels by behavior, prevent concurrency bugs, and treat idempotency as part of correctness.

---

## 4.1 ACID

- **Atomicity** — all or nothing
- **Consistency** — your invariants stay true (YOUR job, not the database's)
- **Isolation** — concurrent transactions don't expose broken intermediate state
- **Durability** — committed data survives crashes

## 4.2 Race conditions — know these cold

| Anomaly | What happens | Fix |
|---------|-------------|-----|
| Dirty read | Read uncommitted data | Read Committed |
| Lost update | Two read-modify-writes, one silently overwrites | Atomic ops or CAS |
| Write skew | Two txns read condition, both write, constraint violated | Serializable |
| Phantom | Query matches new rows from concurrent insert | Serializable + index-range locks |

### Write skew — the interview differentiator

This is the anomaly most candidates miss, and interviewers love it.

```
Radiologist A checks: "study CT-1234 is unassigned" → true
Radiologist B checks: "study CT-1234 is unassigned" → true
A assigns CT-1234 to themselves  → succeeds
B assigns CT-1234 to themselves  → also succeeds
Result: two radiologists think they own the same study.

Under snapshot isolation, BOTH see "unassigned" because they read from
their snapshot. The constraint "one owner at a time" is violated.

Fix: SELECT ... FOR UPDATE (locks the row), or serializable isolation,
or an atomic conditional UPDATE with WHERE status = 'Unassigned'.
```

In OrderFlow this is the same as: two users buy the last concert ticket. Both check stock=1, both decrement, stock goes to -1.

## 4.3 Prevent overselling — three patterns

### Pattern 1: Atomic conditional update (best when possible)

```csharp
public async Task<bool> ReserveStockAsync(string productId, int qty, CancellationToken ct)
{
    const string sql = """
        UPDATE products SET stock_quantity = stock_quantity - @qty
        WHERE id = @productId AND stock_quantity >= @qty;
        """;

    await using var conn = new NpgsqlConnection(_connStr);
    var affected = await conn.ExecuteAsync(
        new CommandDefinition(sql, new { productId, qty }, cancellationToken: ct));
    return affected == 1;
}
```

Collapses read-check-write into one atomic statement. Beautiful.

### Pattern 2: SELECT FOR UPDATE (lock row, then decide)

### Pattern 3: Serializable + retry (when invariant spans complex conditions)

### ✅ Say this
> "I prefer to reason from the business invariant backward. If a weaker tool can protect it — unique constraint, atomic update, optimistic concurrency — I use that. I reach for serializable only when the invariant truly needs it."

## 4.4 Optimistic concurrency in EF Core

```csharp
public sealed class PaymentAttempt
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string Status { get; set; } = "";
    [Timestamp] public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
```

Two writers race → one gets `DbUpdateConcurrencyException`. Better than silent corruption.

## 4.5 Idempotency keys

Retries happen because: clients retry, proxies retry, workers retry, humans click twice, networks fail at the rudest moment.

**Any externally visible write that may be retried needs an idempotency story.**

```csharp
public sealed class ProcessedRequest
{
    public string IdempotencyKey { get; set; } = "";
    public string ResponseJson { get; set; } = "";
    public DateTime ProcessedAtUtc { get; set; }
}

// On each request:
// 1. Check if idempotency key exists → return cached response
// 2. If not → execute once, persist result + key atomically
// 3. Retries return the same outcome safely
```

**Exactly-once is often marketing. Idempotent processing is engineering.**

### 🏥 RadWork transfer

Exclusive claim/assignment = same concurrency class as stock reservation. Duplicate notifications = idempotency / processed-message tracking. Billing transitions = local transaction first, async propagation later.

---

## Mini lab

1. Simulate two concurrent purchases of the last item. Watch it oversell.
2. Fix it with atomic conditional update.
3. Add an idempotency-key table for `POST /orders`.
4. Retry the same request and verify same outcome.

## 🤖 Claude Prompts

```
Give me 3 realistic concurrency bugs in an order system besides overselling. For each,
tell me the invariant being violated and the simplest fix.
```

```
Act like an interviewer and challenge my choice of isolation level. Force me to justify
weaker vs stronger isolation using a concrete business invariant.
```

```
Explain idempotency keys, optimistic concurrency, and serializable transactions as
three different tools for correctness. Compare them cleanly for an interview answer.
```

## Quiz

1. Is consistency solely the database's job?
2. What's the simplest safe pattern for "decrement stock only if enough remains"?
3. Why are retries dangerous without idempotency?
4. When is optimistic concurrency useful?
5. When would serializable be worth the cost?

<details><summary>Answers</summary>

1. No. The database helps, but business rules must be correctly designed.
2. Atomic conditional UPDATE with WHERE clause.
3. "Retry" becomes "duplicate business side effect."
4. When contention is manageable and conflicts can be retried.
5. When the invariant spans complex multi-row conditions.

</details>

## 🗣️ Speak it out loud (3-minute drill)

Explain: atomic conditional update, SELECT FOR UPDATE, idempotency keys. If you mix them up, slow down and do it again.

---

# Day 5 — Distributed Systems Reality, Consistency, Consensus
**⏱ 6–8 hours** | Chapters 8–9

## What interviewers are really testing

Whether you understand that networks, clocks, and processes are all liars.

## Outcome

Explain why distributed systems are hard even when code looks fine, distinguish eventual consistency / linearizability / serializability, explain CAP correctly, and know when consensus is needed vs overkill.

---

## 5.1 The three realities

**Networks are unreliable.** No response? You don't know if the node died, the request died, the response died, or the network paused. You only know: you are uncertain.

**Clocks lie.** Wall clocks jump, drift, disagree. Never build important correctness around "newest timestamp wins."

```csharp
// DANGEROUS — do not use for important conflict resolution
public static Order Merge(Order left, Order right)
{
    return left.UpdatedAtUtc >= right.UpdatedAtUtc ? left : right;
}
// If clocks drift between nodes, you silently lose the correct write.
// Use version numbers or fencing tokens instead.
```

**Processes pause.** GC, OS scheduling, resource contention. A process can look alive to itself and dead to the rest of the world.

### The senior sentence
> "In a distributed system, you cannot distinguish between a slow node and a dead node. That single fact is the root of most distributed systems problems."

## 5.2 Consistency words people confuse

| Term | Meaning |
|------|---------|
| **Eventual consistency** | Replicas converge over time if writes stop |
| **Linearizability** | Appears as one copy, real-time order. Very strong. Expensive. |
| **Serializability** | Concurrent transactions behave as-if-serial. About tx correctness. |

### ✅ Say this
> "Linearizability is about single-object real-time visibility. Serializability is about multi-operation transactional correctness. They are different guarantees."

Confusing them is a common interview fail.

## 5.3 CAP — stated correctly

Not "pick two." Correct:

> "During a network partition, you must choose whether to preserve consistency or availability for the affected operations."

Less catchy. Far more useful.

## 5.4 Consensus

Use when the system must safely choose one answer despite failures: leader election, lock/lease ownership, membership, unique decisions.

### ✅ Say this
> "Consensus is for making one safe decision under failure. I'd avoid implementing it myself and rely on a proven system. I also try to reduce the need for coordination rather than romanticize it."

## 5.5 Fencing tokens — the fix for zombie locks

A lock expires while the holder is GC-paused. A second actor acquires the lock. The first wakes up and writes stale data.

**Fix:** each lock acquisition gets a monotonically increasing token. The storage layer rejects writes from stale tokens.

```csharp
public sealed class FencedWriteGate
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
}
```

## 5.6 Practical consistency decisions for OrderFlow

| Needs strong consistency | Can be eventually consistent |
|---|---|
| Unique order ID / idempotency key | Search index |
| Stock reservation (no oversell) | Analytics dashboard |
| Payment dedup (no double charge) | Redis cache |
| | Recommendation data |

The key question is not "can we make everything strongly consistent?" but **"which invariants actually require it?"** That question is worth money.

### 🏥 RadWork transfer

Strong: unique accession, exclusive claim, no duplicate irreversible action. Eventually consistent: search, analytics, dashboards, cache, notification history.

---

## Mini lab

1. Simulate a Redis lock with TTL expiry.
2. Add a "long pause" and show why naive lock semantics fail.
3. Add a fencing-token check.
4. Write one paragraph on whether OrderFlow's search index should be linearizable.

## 🤖 Claude Prompts

```
Explain eventual consistency, linearizability, and serializability using one order-
processing example. Then tell me which guarantee I likely need for checkout, search,
and analytics.
```

```
Act as an interviewer and ask me CAP theorem questions, but force me to state CAP
correctly instead of using the slogan version.
```

```
Explain why timestamps are dangerous for ordering or conflict resolution in distributed
systems. Give me one bad design and one safer alternative using .NET examples.
```

## Quiz

1. Can you reliably distinguish a dead node from a very slow one?
2. Is linearizability the same as serializability?
3. What does CAP say during a partition?
4. Why can naive distributed locks fail?
5. What kind of things usually do NOT need strong consistency?

<details><summary>Answers</summary>

1. No.
2. No. Linearizability = real-time visibility. Serializability = transaction correctness.
3. Choose consistency or availability for affected operations.
4. Lock expires during a pause; zombie holder wakes up and writes stale data.
5. Search indexes, caches, analytics dashboards, non-critical read projections.

</details>

## 🗣️ Speak it out loud (3-minute drill)

Explain: why clocks lie, CAP stated correctly, why search can usually be eventually consistent.

---

# Day 6 — Batch, Streams, CDC, Event Sourcing, Derived Data
**⏱ 6–8 hours** | Chapters 10–11

## What interviewers are really testing

Whether you understand modern dataflow architecture and can avoid cross-service transaction traps.

## Outcome

Explain batch vs streaming, CDC vs event sourcing, why derived data is normal, and why outbox + idempotent consumers is the practical sweet spot.

---

## 6.1 Batch thinking

Map → group/shuffle → reduce. You see this in SQL aggregation, LINQ, ETL, warehouse transforms. Still useful: easier to reason about, replayable, perfect for rebuilding projections.

## 6.2 Streaming

Useful when latency matters and changes should propagate continuously.

### ✅ Say this
> "I'd use streams when the system benefits from continuous propagation, but I still want replay, observability, and idempotent consumers so the architecture stays recoverable."

## 6.3 CDC vs Event Sourcing

**CDC**: source of truth is current DB state. Change stream derived from mutations. Easier to adopt incrementally.

**Event Sourcing**: source of truth is the event log. State is reconstructed. Strong audit power. Higher conceptual cost.

### ✅ Say this
> "I'd prefer CDC or outbox-driven integration unless the domain strongly benefits from event sourcing. Event sourcing is powerful, but I don't reach for it just because events sound modern."

## 6.4 Derived data is everywhere

Cache, search index, read model, analytics table, dashboard — all derived. Normal. The question: **what is the source of truth, and how do derived views stay recoverable?**

## 6.5 Cache-aside pattern for OrderFlow

```csharp
public async Task<IReadOnlyList<OrderRow>> GetRecentOrdersAsync(
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
}
```

## 6.6 Projection consumer (idempotent, rebuildable)

```csharp
public sealed class OrderSearchProjection
{
    private readonly OrderDbContext _db;

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
```

A projection is allowed to lag. It is NOT allowed to become mysterious. Make it rebuildable. Make it observable. Make it idempotent.

### 🏥 RadWork transfer

Worklist search = derived read model. Critical finding notifications = event-driven flow. Analytics = batch or stream projection off the transactional source.

---

## Mini lab

1. Add an `order_summaries` table.
2. When an order is placed, emit an outbox message.
3. A worker consumes the message and populates the summary.
4. Re-run the same message and prove handling is idempotent.
5. Explain how you would rebuild the projection from scratch.

## 🤖 Claude Prompts

```
Compare batch processing, stream processing, CDC, and event sourcing for an order
system. Give me the answer in interview language, not vendor language.
```

```
I want to keep a search index and analytics tables in sync with my main PostgreSQL
database. Walk me through a practical design using outbox or CDC and tell me what can
go wrong.
```

```
Challenge my architecture: I'm about to use event sourcing. Ask me whether I truly
need it or whether outbox + projections is enough.
```

## Quiz

1. Is derived data suspicious or normal?
2. What is the source of truth in CDC?
3. What is the source of truth in event sourcing?
4. Why is idempotent consumption important?
5. Why is rebuildability valuable?

<details><summary>Answers</summary>

1. Normal. Search, cache, analytics are all derived.
2. The current database state.
3. The event log itself.
4. Because retries and redeliveries are normal in async systems.
5. Recovery from bugs, backfills, schema evolution, operational confidence.

</details>

## 🗣️ Speak it out loud (3-minute drill)

Explain: CDC vs event sourcing, why derived data is normal, why rebuildability is architectural leverage.

---

# Day 7 — Interview Synthesis, Capstone, and Final Review
**⏱ 6–8 hours** | Chapter 12 + synthesis

## What interviewers are really testing

Whether you can tie it all together into a coherent, defensible architecture under pressure.

## Outcome

Give a clean 30–45 minute system-design answer. Choose trade-offs intentionally. Defend a staged evolution path. Recognize your weak areas before the interviewer does.

---

## 7.1 The capstone answer

> "I'd start OrderFlow as a modular monolith with PostgreSQL as the source of truth because the workflow has strong entity relationships and correctness requirements. The write path stays transactional and local. For hot reads, Redis selectively. For search and analytics, derived state populated asynchronously via outbox-driven events.
>
> If read scale grows, I'd add replicas and define stale-read semantics explicitly. I'd route freshness-sensitive reads to the primary. Partitioning comes only after the real hotspot is proven.
>
> For correctness: atomic conditional updates, optimistic concurrency, idempotency keys for retriable writes. No distributed transactions — local transaction + outbox + idempotent consumers.
>
> Strong consistency reserved for business invariants (unique IDs, stock reservation, payment dedup). Search, cache, analytics can be eventually consistent. The goal is not maximum theoretical purity but a system that is correct where it must be, simple to run, and able to evolve safely."

If you can say this calmly and defend every sentence, you are in good shape.

---

## 7.2 The 45-minute interview framework

**Minutes 0–5: Clarify.** Scale assumptions, write/read ratio, latency goals, consistency expectations, failure concerns, region/tenant assumptions.

**Minutes 5–10: Core model.** Main entities, source of truth, critical write path, top read paths.

**Minutes 10–20: First version.** Simplest thing that works — monolith, PostgreSQL, API shape, indexes, local transactions.

**Minutes 20–30: Evolution.** Add only what is justified — cache, search projection, replicas, outbox/broker, worker processing, partitioning if proven.

**Minutes 30–40: Correctness and consistency.** Duplicate requests, concurrent writes, stale reads, crash recovery, replay/rebuild story.

**Minutes 40–45: Risks and trade-offs.** What you chose NOT to build. What could fail. What you'd monitor. What you'd evolve later.

---

## 7.3 Follow-up traps interviewers love

**"Why not microservices immediately?"**
Because I want local correctness, simpler ops, and lower coordination cost until boundaries earn their network hop.

**"Why not shard immediately?"**
Because sharding adds routing, rebalancing, and cross-partition pain. I only pay that cost once the real hotspot is proven.

**"Why not make everything strongly consistent?"**
Because strong consistency everywhere increases coupling, latency, and coordination cost. I reserve it for business invariants.

**"Why not event-source the whole thing?"**
Because the domain may not justify the complexity. Outbox + projections is often enough.

**"What happens if the broker is down?"**
The core local transaction still succeeds. Outbox messages remain pending and publish later. Derived state lags, but source-of-truth correctness is preserved.

**"What happens if the user retries the same payment?"**
Idempotency key catches it. Same result returned, no duplicate charge.

---

## 7.4 Final drills

**Drill 1 — 2 minutes:** Explain why not everything needs strong consistency.

**Drill 2 — 5 minutes:** Design OrderFlow for Black Friday traffic.

**Drill 3 — 10 minutes:** Defend outbox + idempotent consumers against distributed transactions.

**Drill 4 — Red-team yourself:** Where can stale data appear? Duplicates? What if the publisher crashes after DB commit but before publish? What if search lags 10 minutes? What if one tenant becomes a hotspot?

---

## 🤖 Final Claude Prompts

```
Run a full 45-minute mock system design interview for a data-intensive .NET backend
role. Use OrderFlow as the domain. Push me on consistency, transactions, replication
lag, partitioning, outbox, idempotency, and derived data.
```

```
I will paste my system design answer. Grade it on: clarity, trade-off awareness,
correctness, practical .NET implementation, evolution strategy. Rewrite only the
weakest parts.
```

```
Act as a principal engineer and attack my design. Focus on hidden assumptions, stale
reads, duplicate handling, operational recovery, and where I'm paying too much
complexity too early.
```

---

## 7.5 One-page memory map

```
RELIABILITY    Fault ≠ failure. Design fault tolerance. Expect human > software > hardware faults.
SCALABILITY    Define load parameters. Percentiles, not averages. Replicas scale reads. Partition only when proven.
MAINTAINABILITY Operability + simplicity + evolvability. Modular monolith first.
DATA MODELS    Relational for relationships and invariants. Document/JSONB for flexible shapes.
STORAGE        B-tree: predictable reads, relational default. LSM: write-heavy. Indexes follow queries.
OLTP vs OLAP   Separate transactional and analytical workloads. Star schema for analytics.
SCHEMA EVOLUTION Old and new code coexist. Add safely. Backfill. Tighten later.
REPLICATION    Replicas: reads + availability. Lag creates stale-read semantics. Route freshness-sensitive reads to primary.
PARTITIONING   Solves scale limits. Creates routing + rebalancing + cross-partition complexity. Last responsible moment.
TRANSACTIONS   Weakest isolation that protects the invariant. Atomic updates > locks > serializable.
IDEMPOTENCY    Retries happen. Design for them. Every retriable write needs an idempotency story.
OUTBOX         Local tx + outbox + idempotent consumers > distributed transactions. Always.
DISTRIBUTED    Networks, clocks, processes lie. CAP applies during partitions. Fencing tokens > naive locks.
CONSISTENCY    Eventual ≠ linearizable ≠ serializable. Strong consistency only where invariants demand it.
DERIVED DATA   Cache, search, analytics are derived. Source of truth is clear. Projections are rebuildable.
```

---

# 25 Interview Questions You Should Practice

1. What does scalability mean, exactly?
2. Why is p99 latency important?
3. Relational vs document database: how do you choose?
4. Why are joins not automatically bad?
5. What is denormalization and what does it cost?
6. Why does schema evolution matter in distributed systems?
7. What is the difference between OLTP and OLAP?
8. What is an index really buying you?
9. B-tree vs LSM-tree at a high level?
10. Why replicate data?
11. What user-facing bugs can replication lag create?
12. Single leader vs multi-leader vs leaderless?
13. What makes a good partition key?
14. What is a hotspot?
15. Why are transactions useful?
16. What anomaly is a lost update?
17. What does serializable isolation mean?
18. Why does idempotency matter?
19. Why are timeouts ambiguous?
20. Eventual consistency vs linearizability vs serializability?
21. What is consensus for?
22. Why avoid distributed transactions when possible?
23. What is derived data?
24. CDC vs event sourcing?
25. Describe a practical architecture for a scalable, reliable .NET system.

---

# The 10 Answers That Make You Sound Stronger Immediately

1. "Scale with respect to what load parameter?"
2. "What user-visible semantics do we need after a write?"
3. "That view is derived state, so I'd make it rebuildable."
4. "I'd keep the source of truth simple first."
5. "I'd avoid paying for cross-service coordination unless the invariant requires it."
6. "That sounds like a stale-read problem, not just an infra problem."
7. "I'd rather use a local transaction and outbox than distributed ACID."
8. "The right partition key depends on query shape and hotspot risk."
9. "I care more about p95/p99 than average latency."
10. "I'd choose the simplest architecture that preserves correctness and can evolve."

---

# If You Only Have One Day Before an Interview

## Must-review topics
- reliability / scalability / maintainability
- relational vs document
- indexes, OLTP vs OLAP
- replication lag
- partitioning and hotspots
- transactions and anomalies (lost update, write skew)
- idempotency
- eventual consistency vs linearizability vs serializability
- outbox pattern
- derived state

## Must-practice answers
- design an order/worklist/ticketing system end to end
- explain stale reads
- explain why not everything needs strong consistency
- explain when you'd add cache, search, or a broker
- explain why you avoid distributed transactions

---

# Reusable Mega-Prompt

```
Act as a principal software architect coaching a mid-level .NET backend engineer for
technical interviews.

Use DDIA mental models: reliability, scalability, maintainability, data-model choice,
storage/index trade-offs, replication, partitioning, transactions, distributed failure
modes, consistency/consensus, streams, derived data.

Rules:
1. Be practical, not academic.
2. Use OrderFlow (e-commerce) as the interview example and RadWork (medical imaging
   worklist) for production transfer.
3. Translate every concept into what I should say in an interview.
4. Give .NET examples: ASP.NET Core, EF Core, Dapper, PostgreSQL, Redis, brokers,
   BackgroundService.
5. Push back whenever I say something vague.
6. After each explanation, ask me one question to test understanding.
7. Point out where I am over-engineering.
8. Help me separate source-of-truth data from derived state.
9. Help me explain trade-offs clearly.
10. Keep me focused on what matters most for interviews.

Start by asking me 5 diagnostic questions, then coach me based on my weak spots.
```

---

# Personal Study Notes Template

Copy this after each day:

```
Day:
Topic:

What problem is this topic solving?
What are the 3 most important trade-offs?
What would I say in an interview?
What would I build in .NET?
What can go wrong?
What is still unclear to me?
```

---


# What v4 keeps from v3 on purpose

This version keeps the best parts that made v3 strong:

- the **architect mindset**: source of truth, staged evolution, deliberate async boundaries
- the **RadWork / healthcare transfer bridge** so the material maps back to your real world
- the **practical .NET lens**: EF Core for writes, Dapper for hot reads, BackgroundService for workers
- the bias toward **modular monolith first**, replicas before shards, local transactions before distributed coordination

If you are ever torn between a clever answer and a grounded one, choose the grounded one. DDIA rewards that instinct.

# Two extra mock-interview drills

## Drill A — RadWork translation

Take any OrderFlow answer and restate it for a healthcare-style worklist system:
- order → study/work item
- stock reservation → exclusive claim / resource reservation
- search index → worklist projection
- analytics → turnaround-time dashboard
- notification pipeline → critical-finding alert flow

If you can do that translation cleanly, you understand the idea instead of memorizing the domain.

## Drill B — Failure-first review

For any design you give, ask these five questions:
1. Where does the source of truth live?
2. What can be stale, duplicated, or replayed?
3. What invariant truly needs strong consistency?
4. What happens if the broker, cache, or replica is down?
5. What is my next scaling step before sharding?

Strong candidates naturally ask these questions before the interviewer does.


# Final Advice

This book becomes powerful when you stop treating it as "database theory" and start treating it as a way to answer one question:

> "How do I keep a real system correct, fast enough, and changeable under load and failure?"

That is what interviewers are really testing.

If you can explain trade-offs calmly, keep the source of truth clean, avoid unnecessary coordination, and use async derived state deliberately — you will already be ahead of most candidates.
