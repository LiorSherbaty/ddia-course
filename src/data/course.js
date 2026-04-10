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
            type: "subheading",
            text: "Where outages actually come from"
          },
          {
            type: "numbered-list",
            items: [
              "Human error — bad config, bad deploy (the #1 cause, by a wide margin)",
              "Software bugs — cascading failures, resource leaks, poison messages",
              "Hardware — disk failure, NIC death, single-AZ problems"
            ]
          },
          {
            type: "say",
            text: "When I design for reliability, I'm not trying to prevent every fault — I'm trying to stop local faults from becoming visible failures. Retries with budgets, timeouts, health checks, gradual rollout, feature flags, idempotency, and a runbook I've actually rehearsed."
          },
          {
            type: "red-flag",
            text: "We just add more replicas if something breaks."
          },
          {
            type: "follow-up",
            question: "WHAT IF THE DATABASE FAILS AT 3AM?",
            answer: "I assume it will. I keep a replica hot, I practice the promotion runbook before I need it, and I make the app idempotent on retry so a promoted replica can catch late writes without double-charging anyone."
          },
          {
            type: "mental-model",
            text: "Reliability is the budget you spend before the system surprises you."
          }
        ]
      },
      {
        id: "1.2",
        title: "Scalability",
        blocks: [
          {
            type: "interview-quote",
            text: "Scalability is not a property you have. It is always: scalable with respect to which load parameter — and with what latency budget."
          },
          {
            type: "subheading",
            text: "Pick the load parameter first"
          },
          {
            type: "list",
            items: [
              "Orders per second at checkout (write-heavy, latency-sensitive)",
              "Product reads per second on the catalog (read-heavy, cacheable)",
              "Concurrent checkout sessions holding carts",
              "Fan-out per request: how many services does one call touch",
              "Data volume growth per month and per customer"
            ]
          },
          {
            type: "subheading",
            text: "Performance is a distribution"
          },
          {
            type: "say",
            text: "I talk in percentiles, not averages. p50 is the median user, p95 is the unhappy user, p99 is the angry user, p999 is the VIP on Twitter. Averages hide tails, and tails are what you remember."
          },
          {
            type: "callout",
            text: "Tail amplification: if checkout calls 4 services in parallel and each has a 1% chance of being slow, the composed page-level slowness is ~4%. Parallel fan-out is a tail multiplier — plan accordingly."
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
          },
          {
            type: "level-up",
            weak: "We'd scale it.",
            strong: "We'd look at the load parameter first — reads versus writes — and add caching or a read replica before reaching for a full redesign.",
            senior: "Scalability is load-parameter-specific. If it's read-heavy I cache close to the edge and add replicas; if it's write-heavy I shard by the hottest key and protect the tail with timeouts and shedding. The decision is driven by the percentile I'm trying to hold, not by the total traffic number."
          },
          {
            type: "follow-up",
            question: "HOW DO YOU KNOW YOU'RE AT A SCALING LIMIT?",
            answer: "I watch p95 and p99 diverge from p50. When the tail grows while the median stays flat, queueing is starting — that's my warning shot, not the CPU graph."
          },
          {
            type: "mental-model",
            text: "Scale is a question about which percentile you refuse to let slip, not about how big the number gets."
          }
        ]
      },
      {
        id: "1.3",
        title: "Maintainability",
        blocks: [
          {
            type: "interview-quote",
            text: "Maintainability is operability, simplicity, and evolvability — all measured by the engineer who has to change this system at 2am six months from now."
          },
          {
            type: "list",
            items: [
              "Operability — easy to run, observe, and recover",
              "Simplicity — easy to hold in your head without a map",
              "Evolvability — easy to change safely as requirements shift"
            ]
          },
          {
            type: "say",
            text: "I start with a modular monolith unless a hard reason says otherwise. It gives me real local transactions, one deploy, one log stream, and fewer network failure modes to reason about. I can split later when a boundary proves itself."
          },
          {
            type: "red-flag",
            text: "We went microservices from day one so we can scale."
          },
          {
            type: "follow-up",
            question: "WHEN WOULD YOU SPLIT A SERVICE OUT?",
            answer: "When a single module has a different scaling shape, a different deploy cadence, or a different reliability budget from the rest. Not because the repo is big."
          },
          {
            type: "mental-model",
            text: "A clever design nobody can safely modify is deferred downtime."
          }
        ]
      },
      {
        id: "1.4",
        title: "Data Models",
        blocks: [
          {
            type: "interview-quote",
            text: "The data model decides the shape of every future change. I pick it to match invariants, not to match fashion."
          },
          {
            type: "trade-off",
            left: {
              label: "Relational",
              points: [
                "Strong relationships and constraints",
                "Joins are free and boring",
                "Transactions give you invariants cheaply",
                "Schema is a contract, not a suggestion"
              ]
            },
            right: {
              label: "Document",
              points: [
                "Self-contained records, no joins",
                "Flexible shape per subtype",
                "Denormalized reads are fast",
                "Writes across documents get awkward"
              ]
            }
          },
          {
            type: "say",
            text: "For the core write path I usually prefer relational — especially when invariants and relationships matter. For flexible or read-heavy shapes I use JSONB columns or denormalized projections. I don't treat it as an either-or."
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
          },
          {
            type: "follow-up",
            question: "WHY NOT JUST USE JSONB EVERYWHERE?",
            answer: "Because invariants that used to be enforced by a foreign key become invariants enforced by every writer. That's a contract you cannot see, and someone will break it on a Friday afternoon."
          },
          {
            type: "mental-model",
            text: "Model the invariants first. The storage engine is a downstream decision."
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
            type: "interview-quote",
            text: "The storage engine you pick decides what kind of failure you'll debug at 3am. B-tree failures look different from LSM-tree failures."
          },
          {
            type: "trade-off",
            left: {
              label: "B-tree",
              points: [
                "Update in place, predictable reads",
                "4 disk reads gets you to 62 billion keys",
                "Fragmentation is the long-term cost",
                "Writes pay for the in-place update"
              ]
            },
            right: {
              label: "LSM-tree",
              points: [
                "Append only, sequential writes win",
                "Compaction spikes are the long-term cost",
                "Read amplification across levels",
                "Wins on write-heavy append workloads"
              ]
            }
          },
          {
            type: "say",
            text: "For read-heavy OLTP and rich queries I default to B-tree-backed PostgreSQL. For high-ingest append-heavy workloads, I reach for LSM because it turns random writes into sequential writes — and that's the one optimization disks still really care about."
          },
          {
            type: "echo",
            refDay: 1,
            refSection: "1.1",
            text: "Compaction spikes are Day 1's reliability question in a different outfit: a local fault you stop from becoming a visible failure by scheduling and smoothing."
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
          },
          {
            type: "follow-up",
            question: "HOW DO YOU PICK BETWEEN B-TREE AND LSM?",
            answer: "I pick the one whose worst day matches the day my workload creates most often. Read-heavy with rich queries? B-tree's fragmentation is a problem I can schedule. Write-heavy append stream? LSM's compaction is a problem I can smooth."
          },
          {
            type: "mental-model",
            text: "Every storage engine is a bet about which operation you can afford to pay for later."
          }
        ]
      },
      {
        id: "2.2",
        title: "Indexes Follow Access Patterns",
        blocks: [
          {
            type: "interview-quote",
            text: "Indexes aren't free. Every index is a promise to maintain something you don't see, paid for in write latency and storage."
          },
          {
            type: "red-flag",
            text: "We indexed everything just in case."
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
          },
          {
            type: "follow-up",
            question: "WHY NOT JUST INDEX EVERY COLUMN WE FILTER ON?",
            answer: "Because every index turns one write into N+1 writes. I index the paths my hot queries actually take, and I let the rare query take the scan hit."
          },
          {
            type: "mental-model",
            text: "An index is a standing order: 'keep this sorted for me, forever, even on the day nobody queries it.'"
          }
        ]
      },
      {
        id: "2.3",
        title: "OLTP vs OLAP",
        blocks: [
          {
            type: "interview-quote",
            text: "Mixing OLTP and OLAP on one database is how you learn that your 'occasional report' is actually locking up order intake."
          },
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
            type: "trade-off",
            left: {
              label: "Row-oriented (OLTP)",
              points: [
                "Whole row on one page",
                "Cheap to read or write one order end-to-end",
                "Expensive to scan one column across millions of rows",
                "Poor compression — mixed types sit together"
              ]
            },
            right: {
              label: "Column-oriented (OLAP)",
              points: [
                "Each column stored and compressed separately",
                "Scans only the columns the query touches",
                "Heavy per-row updates — not the tool for that",
                "Compresses hard because neighbors share a type"
              ]
            }
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
          },
          {
            type: "follow-up",
            question: "WHERE DOES THE OLAP DATA EVEN COME FROM?",
            answer: "CDC or periodic ETL from the OLTP system into the analytics store. The transactional database stays the source of truth; the warehouse is a derived projection shaped for scans."
          },
          {
            type: "echo",
            refDay: 1,
            refSection: "1.2",
            text: "Same idea as Day 1's latency-vs-throughput split: OLTP is a latency system, OLAP is a throughput system, and one storage shape cannot win both."
          },
          {
            type: "mental-model",
            text: "OLTP asks 'what's happening right now?' OLAP asks 'what happened, and what does the shape of it tell us?' Different questions, different storage shapes."
          }
        ]
      },
      {
        id: "2.4",
        title: "Safe Schema Evolution",
        blocks: [
          {
            type: "interview-quote",
            text: "Schema changes are where 'zero-downtime deploy' meets 'we bricked the API for 12 minutes.' Everything between is about respecting that old code is still running."
          },
          {
            type: "red-flag",
            text: "We renamed the column and deployed."
          },
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
            type: "follow-up",
            question: "HOW DO YOU RENAME A COLUMN SAFELY, THEN?",
            answer: "Add the new column. Dual-write to both. Backfill historical rows. Flip readers to the new column. Only then drop the old column in a later deploy. Four steps, four deploys, zero downtime."
          },
          {
            type: "level-up",
            weak: "We add the column and hope nothing breaks.",
            strong: "We use expand-contract: add nullable, dual-write, backfill, switch readers, drop the old field.",
            senior: "Every schema change is a rolling-deploy compatibility problem. Old code and new code have to coexist cleanly for the duration of the rollout and the rollback window — so the migration is a sequence of individually-safe deploys, not a single change."
          },
          {
            type: "radwork",
            text: "Decide: what stays transactional in PostgreSQL, what becomes search/index projection, what reporting gets pushed out, how versioned contracts tolerate mixed deployments across services."
          },
          {
            type: "echo",
            refDay: 1,
            refSection: "1.4",
            text: "Day 1 said reliability is the operational discipline of not turning faults into failures. Safe schema evolution is that discipline on the data layer: a careless migration is a self-inflicted fault."
          },
          {
            type: "mental-model",
            text: "Schemas don't change — deployments change. The schema is just the shape multiple running versions have to agree on for the duration of the rollout."
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
            type: "interview-quote",
            text: "Replication isn't about copying data. It's about deciding who's allowed to be wrong, and for how long, and what happens to the user who read the wrong version."
          },
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
            type: "trade-off",
            left: {
              label: "Synchronous replication",
              points: [
                "Reader sees committed writes immediately",
                "Every write waits for every replica",
                "One slow replica blocks the primary",
                "Strong guarantees, brittle latency"
              ]
            },
            right: {
              label: "Asynchronous replication",
              points: [
                "Primary commits independently, fast writes",
                "Replicas lag by some window you can measure",
                "Stale reads are a normal condition, not a bug",
                "Weaker guarantees, resilient latency"
              ]
            }
          },
          {
            type: "say",
            text: "For most systems I'd start with leader-based replication, asynchronous by default. I'd reach for multi-leader or leaderless only when the write topology truly demands it."
          },
          {
            type: "follow-up",
            question: "WHY NOT JUST GO MULTI-LEADER FROM DAY ONE?",
            answer: "Because conflict resolution is a design problem in disguise. The moment two leaders accept conflicting writes, you own a policy: last-write-wins, CRDTs, or human intervention. Single-leader lets me sidestep that policy until the business model actually needs it."
          },
          {
            type: "mental-model",
            text: "Replication is a contract about how much of the past readers are allowed to see. Pick the contract the product can live with, not the one the database defaults to."
          }
        ]
      },
      {
        id: "3.2",
        title: "Replication Lag Leaks to Users",
        blocks: [
          {
            type: "interview-quote",
            text: "Every replication lag bug is a user experience bug wearing infrastructure clothing. The database is fine. The user is confused."
          },
          {
            type: "red-flag",
            text: "The replicas are eventually consistent, so we just read from any of them."
          },
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
          },
          {
            type: "follow-up",
            question: "HOW DO YOU DECIDE WHICH ENDPOINTS NEED FRESH READS?",
            answer: "I look at what the user just did. If they wrote something and are about to look at it — order placed, profile updated, worklist reassigned — that's a read-your-own-writes path and it hits the primary. Everything else tolerates the replica window."
          },
          {
            type: "echo",
            refDay: 1,
            refSection: "1.3",
            text: "Same framing as Day 1's CAP: a partition between primary and replica is the network telling you to choose, and the user's context is what makes that choice interesting."
          },
          {
            type: "mental-model",
            text: "Every replica is a time machine pointing at the recent past. Routing reads is really about deciding which users are allowed to see the past and which aren't."
          }
        ]
      },
      {
        id: "3.3",
        title: "Partitioning",
        blocks: [
          {
            type: "interview-quote",
            text: "Partitioning is the operation you cannot undo cheaply. Picking the wrong partition key is the mistake that shows up eighteen months later as a migration project nobody budgeted for."
          },
          {
            type: "text",
            text: "Partition when: one machine can't hold the data or handle the writes."
          },
          {
            type: "text",
            text: "Range-based: good for range queries, bad for hotspots. Hash-based: even spread, kills range queries."
          },
          {
            type: "trade-off",
            left: {
              label: "Range partitioning",
              points: [
                "Range scans stay efficient — natural for time-series",
                "Hot ranges concentrate load on one partition",
                "Rebalancing means splitting ranges carefully",
                "Great when queries mirror the partition key ordering"
              ]
            },
            right: {
              label: "Hash partitioning",
              points: [
                "Even load distribution — no natural hotspot",
                "Range queries fan out across every partition",
                "Key hashing kills any notion of 'nearby' data",
                "Great when access is point lookups by key"
              ]
            }
          },
          {
            type: "red-flag",
            text: "We'll just partition by customer_id and figure out the rest later."
          },
          {
            type: "say",
            text: "I'd avoid partitioning until the real hotspot is proven. It adds routing, rebalancing, and cross-partition query complexity."
          },
          {
            type: "follow-up",
            question: "HOW DO YOU EVEN PICK A PARTITION KEY?",
            answer: "I look at the hot queries first, then the write distribution. The key has to keep related data together for the reads that matter and spread the write load across partitions. If those two goals fight, the product owner gets a decision to make."
          },
          {
            type: "mental-model",
            text: "A partition key is a bet about which dimension of your data will stay stable for years. Bet on the dimension the business cares about, not the one that's convenient today."
          }
        ]
      },
      {
        id: "3.4",
        title: "The Outbox Pattern — Most Practical DDIA Takeaway",
        blocks: [
          {
            type: "interview-quote",
            text: "Dual-write is the polite name for 'two systems that silently disagree and no one notices until a customer calls.' The outbox is how you stop doing dual-writes without knowing you're doing them."
          },
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
            type: "follow-up",
            question: "WHAT IF THE OUTBOX WORKER PUBLISHES THE SAME MESSAGE TWICE?",
            answer: "It will — that's a feature, not a bug. At-least-once delivery is the only honest guarantee across process boundaries. Consumers have to be idempotent, keyed on a stable message ID, so a replay is a no-op."
          },
          {
            type: "level-up",
            weak: "We write to the database and then publish to the broker.",
            strong: "We write the row and the outbox message in one transaction, and a background worker drains the outbox.",
            senior: "We stopped dual-writing. The transaction is the atomic unit, the outbox is the handoff, the worker is the shipper, and consumers are idempotent. The whole chain survives crashes at every step because no single step has to do two things at once."
          },
          {
            type: "echo",
            refDay: 2,
            refSection: "2.4",
            text: "Day 2 said schemas don't change, deployments change. Outbox is the same discipline at the messaging boundary: dual-write doesn't fail on the happy path, it fails on the deploy where one half restarts and the other doesn't."
          },
          {
            type: "radwork",
            text: "Write truth in one DB. Read replicas for low-risk views only. Outbox for notifications and search updates. Partition only after you understand whether hotspots are by tenant, site, modality, or time window."
          },
          {
            type: "mental-model",
            text: "The outbox is a ledger of 'things I promised to tell someone.' Commit the promise atomically with the business fact, and shipping the promise becomes a retryable, restartable chore instead of a correctness problem."
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
            type: "interview-quote",
            text: "ACID is four letters, but only three of them are the database's problem. The C is yours, and it's the one that actually ships the bug."
          },
          {
            type: "list",
            items: [
              "Atomicity — all or nothing",
              "Consistency — your invariants stay true (YOUR job, not the database's)",
              "Isolation — concurrent transactions don't expose broken intermediate state",
              "Durability — committed data survives crashes"
            ]
          },
          {
            type: "say",
            text: "I don't treat ACID as marketing. I treat it as four separate promises, each of which has a cost, and I negotiate them based on what the business invariant actually needs."
          },
          {
            type: "follow-up",
            question: "IF THE DATABASE HANDLES ATOMICITY AND DURABILITY, WHY DO INVARIANTS STILL BREAK?",
            answer: "Because the invariant lives in my head, not in the schema. 'One user gets the last seat' is a rule I have to encode — with a unique constraint, an atomic update, or serializable isolation. The database only enforces what I asked it to enforce."
          },
          {
            type: "mental-model",
            text: "Atomicity and Durability are gifts from the database. Isolation is a negotiation. Consistency is the part where the engineer shows up."
          }
        ]
      },
      {
        id: "4.2",
        title: "Race Conditions — Know These Cold",
        blocks: [
          {
            type: "interview-quote",
            text: "Isolation levels aren't named after guarantees. They're named after anomalies they happen to prevent. You don't pick an isolation level — you pick the anomaly you can't tolerate, and the level comes with it."
          },
          {
            type: "red-flag",
            text: "We set isolation to Read Committed because it's the default and it's fast enough."
          },
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
          },
          {
            type: "follow-up",
            question: "WHY DOESN'T SNAPSHOT ISOLATION CATCH WRITE SKEW?",
            answer: "Because both transactions read a consistent snapshot — and those snapshots agree that the precondition holds. Nothing in the model says 'hey, someone else is about to violate this same invariant.' Write skew is the anomaly where the snapshots are individually fine and collectively wrong."
          },
          {
            type: "mental-model",
            text: "A race condition is what happens when two transactions agree on the past, disagree about the future, and the database wasn't told which of them was supposed to win."
          }
        ]
      },
      {
        id: "4.3",
        title: "Prevent Overselling — Three Patterns",
        blocks: [
          {
            type: "interview-quote",
            text: "Overselling isn't a bug in the code. It's a bug in the assumption that the read and the write are one thing."
          },
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
          },
          {
            type: "level-up",
            weak: "We lock the row while we check stock.",
            strong: "We use an atomic conditional UPDATE so read and write collapse into one statement.",
            senior: "I start from the invariant — 'stock never goes negative' — and pick the weakest primitive that enforces it. Atomic UPDATE handles this one. SELECT FOR UPDATE is for invariants that span more than one column. Serializable is for invariants that span more than one row. The invariant picks the tool, not the other way around."
          },
          {
            type: "echo",
            refDay: 3,
            refSection: "3.4",
            text: "Same pattern as Day 3's outbox: collapse two actions into one atomic unit so there's no window where the system is in a half-done state."
          },
          {
            type: "mental-model",
            text: "Every 'check-then-do' is a race condition waiting to meet its twin. The fix is always the same shape: turn the check and the do into a single atomic operation the database enforces."
          }
        ]
      },
      {
        id: "4.4",
        title: "Optimistic Concurrency & Idempotency Keys",
        blocks: [
          {
            type: "interview-quote",
            text: "Exactly-once delivery is a marketing claim. Idempotent processing is an engineering one, and it's the one that survives contact with production."
          },
          {
            type: "trade-off",
            left: {
              label: "Pessimistic (SELECT FOR UPDATE)",
              points: [
                "Blocks competing writers until you commit",
                "Zero rollbacks — the winner is decided upfront",
                "Lock contention under load",
                "Use when conflicts are common or costly to retry"
              ]
            },
            right: {
              label: "Optimistic (row version)",
              points: [
                "No locks — writers race and one loses on commit",
                "Losers retry with fresh state",
                "Scales better when conflicts are rare",
                "Use when contention is light and retries are cheap"
              ]
            }
          },
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
            type: "follow-up",
            question: "WHAT HAPPENS IF THE CLIENT SENDS A DIFFERENT BODY WITH THE SAME IDEMPOTENCY KEY?",
            answer: "That's a client bug, and I want to surface it loudly. I hash the request body alongside the key — on a mismatch, I return an error instead of silently returning the cached response. Idempotency means 'the same request has the same outcome,' not 'any request with this key gets the old answer.'"
          },
          {
            type: "red-flag",
            text: "Retries are safe because the client only retries on timeouts."
          },
          {
            type: "echo",
            refDay: 3,
            refSection: "3.4",
            text: "The outbox consumers from Day 3 need idempotency for exactly this reason: at-least-once delivery plus idempotent handlers is the only honest combination that survives crashes and replays."
          },
          {
            type: "radwork",
            text: "Exclusive claim/assignment = same concurrency class as stock reservation. Duplicate notifications = idempotency / processed-message tracking. Billing transitions = local transaction first, async propagation later."
          },
          {
            type: "mental-model",
            text: "Optimistic concurrency is trusting that conflicts are rare and making them explicit when they happen. Idempotency keys are trusting that retries are common and making them harmless when they happen."
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
            type: "interview-quote",
            text: "In a distributed system, you cannot distinguish between a slow node and a dead node. That single fact is the root of most distributed systems problems."
          },
          {
            type: "text",
            text: "Networks are unreliable. No response? You don't know if the node died, the request died, the response died, or the network paused. You only know: you are uncertain."
          },
          {
            type: "text",
            text: "Clocks lie. Wall clocks jump, drift, disagree. Never build important correctness around 'newest timestamp wins.'"
          },
          {
            type: "red-flag",
            text: "We'll just use the timestamp to figure out which write wins."
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
            type: "follow-up",
            question: "IF YOU CAN'T TRUST CLOCKS OR THE NETWORK, HOW DO YOU EVER ORDER EVENTS?",
            answer: "I stop trying to order them by wall clock and start ordering them by causality — version vectors, monotonic sequence numbers, a single authoritative log. The moment ordering matters for correctness, I want one producer with a counter, not N producers with wristwatches."
          },
          {
            type: "echo",
            refDay: 1,
            refSection: "1.3",
            text: "Day 1's CAP said the network will eventually force a choice. Day 5 is the same story at finer resolution: every 'no response' is a partition in miniature, and the choice shows up in whether you proceed or wait."
          },
          {
            type: "mental-model",
            text: "Distributed systems are just 'programs where you can't tell the difference between slow and broken.' Every hard problem downstream is a consequence of that one sentence."
          }
        ]
      },
      {
        id: "5.2",
        title: "Consistency Words People Confuse",
        blocks: [
          {
            type: "interview-quote",
            text: "When someone says 'we need strong consistency,' they usually mean one of four things, and none of them is what the database vendor meant. The whole conversation has to start with definitions."
          },
          {
            type: "trade-off",
            left: {
              label: "Linearizability",
              points: [
                "One-copy illusion — reads see the latest write",
                "Requires coordination across replicas",
                "Latency hit proportional to network diameter",
                "Expensive, and worth it for leader election and uniqueness"
              ]
            },
            right: {
              label: "Eventual consistency",
              points: [
                "Each replica accepts reads locally",
                "Replicas converge in the background",
                "Reads may briefly lag or disagree",
                "Cheap, and sufficient for search, cache, analytics"
              ]
            }
          },
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
          },
          {
            type: "follow-up",
            question: "WHEN DO YOU ACTUALLY NEED LINEARIZABILITY?",
            answer: "Rarely. Leader election, uniqueness constraints on globally visible IDs, and a handful of coordination primitives. Most features people call 'strongly consistent' just need serializability within one node, which is cheaper and local."
          },
          {
            type: "mental-model",
            text: "Linearizability is about one object seen in real time. Serializability is about many objects seen together. Eventual consistency is the promise that the disagreement is temporary — not that it doesn't exist."
          }
        ]
      },
      {
        id: "5.3",
        title: "CAP — Stated Correctly",
        blocks: [
          {
            type: "red-flag",
            text: "CAP says we can only pick two, so we picked AP."
          },
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
          },
          {
            type: "follow-up",
            question: "WHY IS THE 'PICK TWO' VERSION WRONG?",
            answer: "Because partition tolerance isn't optional in a distributed system — partitions happen whether or not your diagram shows them. The real choice is much smaller: when a partition actually occurs, which affected operations do I fail and which do I answer with possibly stale data? That's a per-endpoint decision, not a global one."
          },
          {
            type: "echo",
            refDay: 3,
            refSection: "3.2",
            text: "Day 3's read routing was already answering CAP on a per-endpoint basis: 'this read must hit the primary because the user just wrote' is a C-over-A decision for one route, and 'this dashboard can lag 30 seconds' is the opposite."
          },
          {
            type: "mental-model",
            text: "CAP is not a taxonomy of databases. It's a reminder that the network gets a vote, and when it votes, you have to know in advance which of your users you're willing to make wait."
          }
        ]
      },
      {
        id: "5.4",
        title: "Fencing Tokens — Fix for Zombie Locks",
        blocks: [
          {
            type: "interview-quote",
            text: "The zombie lock problem is proof that 'I held the lock' and 'I should be allowed to write' are not the same sentence. Fencing tokens turn the second sentence into one the storage layer can verify."
          },
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
            type: "follow-up",
            question: "WHY NOT JUST EXTEND THE LOCK TTL UNTIL PAUSES CAN'T HAPPEN?",
            answer: "Because there's no TTL long enough. 'Long enough' is whatever the worst GC pause is, and the worst GC pause is the one you haven't seen yet. Fencing is cheaper and correct instead of long and probably-correct."
          },
          {
            type: "radwork",
            text: "Strong: unique accession, exclusive claim, no duplicate irreversible action. Eventually consistent: search, analytics, dashboards, cache, notification history."
          },
          {
            type: "mental-model",
            text: "A lock is permission. A fencing token is proof. Permission can go stale while you sleep; proof can't, because proof is a number the downstream system checks against the last one it saw."
          }
        ]
      },
      {
        id: "5.5",
        title: "Practical Consistency Decisions",
        blocks: [
          {
            type: "interview-quote",
            text: "The senior answer isn't 'we use strong consistency everywhere.' It's 'we have a list of invariants that need it, and everything else gets the cheaper guarantee.'"
          },
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
          },
          {
            type: "level-up",
            weak: "Everything uses the primary so nothing is stale.",
            strong: "We split into strong-consistency paths (uniqueness, stock, payment dedup) and eventually-consistent paths (search, analytics, cache).",
            senior: "Consistency is a per-invariant decision, not a system-wide setting. Every invariant gets audited: does this break if it lags one second? Five? A minute? The answer determines the storage, the routing, and the contract we give the user. Most invariants can live with lag. The ones that can't are rare and expensive, and they're the ones that justify coordination."
          },
          {
            type: "mental-model",
            text: "Consistency is a budget you spend per invariant. Overspend and the system gets slow and brittle. Underspend and one invariant gets quietly violated. The craft is knowing which invariants deserve the expense."
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
            type: "interview-quote",
            text: "Batch isn't obsolete just because streaming exists. Batch is the job you can rerun at 3am to rebuild a projection after a bug. Streaming is the job you can't."
          },
          {
            type: "text",
            text: "Batch: Map → group/shuffle → reduce. Still useful: easier to reason about, replayable, perfect for rebuilding projections."
          },
          {
            type: "trade-off",
            left: {
              label: "Batch",
              points: [
                "Deterministic over a fixed input window",
                "Cheap to replay — same input, same output",
                "Higher latency — minutes to hours",
                "Debugging is easier because inputs don't move"
              ]
            },
            right: {
              label: "Streaming",
              points: [
                "Continuous, low-latency propagation",
                "Replay is harder — you need an event log",
                "Watermarks and late events need a policy",
                "Debugging is harder because time is a variable"
              ]
            }
          },
          {
            type: "say",
            text: "I'd use streams when the system benefits from continuous propagation, but I still want replay, observability, and idempotent consumers so the architecture stays recoverable."
          },
          {
            type: "follow-up",
            question: "WHY EVER RUN BATCH JOBS WHEN YOU HAVE STREAMING?",
            answer: "Because rebuilding a projection from scratch is a batch problem wearing a streaming costume. The moment a consumer has a bug and you need to reprocess three months of history, you want the determinism of a batch job over a fixed window, not a live stream you're afraid to touch."
          },
          {
            type: "mental-model",
            text: "Batch is a photograph. Streaming is a film. You reach for the photograph when you want to study something without it moving underneath you."
          }
        ]
      },
      {
        id: "6.2",
        title: "CDC vs Event Sourcing",
        blocks: [
          {
            type: "interview-quote",
            text: "CDC and event sourcing look similar from outside and feel completely different inside. The difference is whether the events are the system of record or just a view of it."
          },
          {
            type: "text",
            text: "CDC: source of truth is current DB state. Change stream derived from mutations. Easier to adopt incrementally."
          },
          {
            type: "text",
            text: "Event Sourcing: source of truth is the event log. State is reconstructed. Strong audit power. Higher conceptual cost."
          },
          {
            type: "trade-off",
            left: {
              label: "CDC",
              points: [
                "The database stays the source of truth",
                "You can adopt it on an existing schema",
                "Events reflect row state, not business intent",
                "Rebuild is 'snapshot + replay diff'"
              ]
            },
            right: {
              label: "Event sourcing",
              points: [
                "The event log is the source of truth",
                "Every state is reconstructed by replay",
                "Events capture business intent and history",
                "Schema changes require versioned event handlers"
              ]
            }
          },
          {
            type: "say",
            text: "I'd prefer CDC or outbox-driven integration unless the domain strongly benefits from event sourcing. Event sourcing is powerful, but I don't reach for it just because events sound modern."
          },
          {
            type: "red-flag",
            text: "We went event sourcing because audit logs are important."
          },
          {
            type: "follow-up",
            question: "WHEN IS EVENT SOURCING ACTUALLY THE RIGHT CALL?",
            answer: "When the business genuinely thinks in events — ledger systems, workflow engines, anything where 'what happened and in what order' is the product, not a side effect. If you're using it just for an audit trail, an append-only log plus a normal schema is cheaper and easier to evolve."
          },
          {
            type: "mental-model",
            text: "CDC ships diffs between snapshots. Event sourcing ships the history that produced the snapshot. Different stories about the same data, different failure modes."
          }
        ]
      },
      {
        id: "6.3",
        title: "Derived Data Is Everywhere",
        blocks: [
          {
            type: "interview-quote",
            text: "If you flinch at the phrase 'derived data,' you'll build systems that try to keep everything in one place and quietly fail at one of the things that place is bad at."
          },
          {
            type: "text",
            text: "Cache, search index, read model, analytics table, dashboard — all derived. Normal. The question: what is the source of truth, and how do derived views stay recoverable?"
          },
          {
            type: "echo",
            refDay: 2,
            refSection: "2.3",
            text: "Same story as Day 2's OLTP/OLAP split: the transactional database is the source of truth, and every other shape — analytics, search, dashboard — is a derived projection shaped for a different query pattern."
          },
          {
            type: "follow-up",
            question: "IF DERIVED DATA GOES OUT OF SYNC, HOW DO YOU KNOW?",
            answer: "You instrument lag, not correctness. Every projection has a measurable 'how far behind the source am I?' metric, and an alarm on a threshold that reflects what the product can tolerate. Correctness is checked by the rebuilt projection — which you can do any time because you designed it to be rebuildable."
          },
          {
            type: "mental-model",
            text: "A derived view is a promise: 'I will eventually look like the source.' Every derived view needs three things — a source, a transformation, and a way to be rebuilt from scratch."
          }
        ]
      },
      {
        id: "6.4",
        title: "Cache-Aside Pattern",
        blocks: [
          {
            type: "interview-quote",
            text: "Cache-aside is the pattern that looks obvious and is two bugs away from a stale-read outage on your busiest day. Every line is load-bearing."
          },
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
          },
          {
            type: "red-flag",
            text: "We invalidate the cache on every write."
          },
          {
            type: "follow-up",
            question: "WHEN DO YOU INVALIDATE THE CACHE?",
            answer: "Almost never actively. I set a TTL that matches what the product can tolerate and let the cache expire on its own. Active invalidation introduces a second atomicity problem — now you have to keep the DB and the cache in sync under failure — and the cure is often worse than the staleness it's curing."
          },
          {
            type: "mental-model",
            text: "A cache is a lie the system tells about the past. Pick a TTL that keeps the lie small enough for the product to not care."
          }
        ]
      },
      {
        id: "6.5",
        title: "Idempotent Projection Consumer",
        blocks: [
          {
            type: "interview-quote",
            text: "A projection consumer is the place where distributed systems theory meets a single foreach loop. Everything from Day 3 and Day 5 either holds or doesn't hold right here."
          },
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
            type: "level-up",
            weak: "We store the search index and update it when orders change.",
            strong: "We emit an outbox message on order placement, a worker consumes it, updates the search index idempotently, and we can replay the stream to rebuild.",
            senior: "The search index is a derived projection. It has a single upstream source of truth — the orders table — and a consumer that's idempotent, restartable, and rebuildable from scratch. I can lose the index tomorrow and rebuild it from the event log by tomorrow evening. Every derived view in the system follows that same three-way contract: source, transformation, rebuild path."
          },
          {
            type: "echo",
            refDay: 3,
            refSection: "3.4",
            text: "This is where the outbox pattern from Day 3 and the idempotency pattern from Day 4 meet: the outbox ships the message, the consumer handles it idempotently, and the projection is the derived view that falls out of the whole chain."
          },
          {
            type: "radwork",
            text: "Worklist search = derived read model. Critical finding notifications = event-driven flow. Analytics = batch or stream projection off the transactional source."
          },
          {
            type: "mental-model",
            text: "A projection consumer is a function over a stream, not a write to a database. Treat it like a pure function that happens to persist its output and the whole architecture becomes recoverable."
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
          },
          {
            type: "echo",
            refDay: 1,
            refSection: "1.4",
            text: "Every clause in this capstone traces back to Day 1's three pillars: reliability for the write path, scalability for the read path, maintainability for the evolution story. The capstone is the three pillars spoken out loud with specific nouns."
          },
          {
            type: "mental-model",
            text: "A capstone answer is not a tour of everything you know. It's a single coherent story that defends itself on every sentence and admits what it chose not to build."
          }
        ]
      },
      {
        id: "7.2",
        title: "The 45-Minute Interview Framework",
        blocks: [
          {
            type: "interview-quote",
            text: "The candidates who lose this round don't lose because they don't know things. They lose because they dump everything they know in the first ten minutes and have nothing left for the follow-ups."
          },
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
          },
          {
            type: "red-flag",
            text: "Let me draw the full microservices architecture with Kafka and a service mesh first, then we can talk about the problem."
          },
          {
            type: "follow-up",
            question: "WHAT'S THE SINGLE MOST COMMON MISTAKE IN THE FIRST TEN MINUTES?",
            answer: "Skipping the clarifying questions. Candidates start drawing boxes before they know the write/read ratio, the latency budget, or whether the interviewer cares about global distribution. Five minutes of clarification saves twenty minutes of redesigning mid-answer."
          },
          {
            type: "mental-model",
            text: "The framework is not a script. It's a budget. Spend more time on whichever phase the interviewer leans into and less on the ones they nod through."
          }
        ]
      },
      {
        id: "7.3",
        title: "Follow-Up Traps Interviewers Love",
        blocks: [
          {
            type: "interview-quote",
            text: "Every follow-up is the interviewer asking 'did you actually think about this, or did you memorize a cache pattern from a blog post?' The good answer sounds like a decision, not a recitation."
          },
          {
            type: "trade-off",
            left: {
              label: "Modular monolith",
              points: [
                "Local transactions across modules",
                "One deploy, one stack trace, one database",
                "Cheap to refactor module boundaries",
                "Scales by process, not by service count"
              ]
            },
            right: {
              label: "Microservices",
              points: [
                "Independent deploys and team ownership",
                "Distributed failures, coordination, and tracing",
                "Module boundaries become network boundaries",
                "Scales by team, but at real coordination cost"
              ]
            }
          },
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
          },
          {
            type: "level-up",
            weak: "We use a monolith because microservices are complex.",
            strong: "I start with a modular monolith because local transactions are cheaper than distributed ones, and I split into services once a boundary earns its network hop.",
            senior: "Every architectural choice I make is a bet about where the complexity will land. Microservices move complexity into the network and into coordination. Monoliths keep it in the process. I'd rather own complexity I can debug with a stack trace than complexity I can only debug with distributed tracing — until the organizational or scaling cost forces the split. That day will come, and when it does, the split is a migration, not a rewrite."
          },
          {
            type: "echo",
            refDay: 4,
            refSection: "4.4",
            text: "The idempotency answer here is Day 4.4 spoken in one breath. Follow-up traps are easier when you can trace each answer back to the day it was earned."
          },
          {
            type: "mental-model",
            text: "A follow-up trap is not an attack. It's an invitation to show that you know what you chose not to do and why. The best answer admits the cost of the choice out loud."
          }
        ]
      },
      {
        id: "7.4",
        title: "Final Drills",
        blocks: [
          {
            type: "interview-quote",
            text: "The last thing you do before the interview is not re-read the notes. It's run the drills out loud, under a timer, so the sentences are already in your mouth when the question lands."
          },
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
          },
          {
            type: "echo",
            refDay: 5,
            refSection: "5.5",
            text: "Day 5 framed consistency as a per-invariant budget. The red-team drill is the other half of that framing: you go looking for the invariants you underspent on, and you fix them before the interviewer finds them."
          },
          {
            type: "mental-model",
            text: "Red-teaming yourself is the cheapest way to find out what's missing. Every gap you find in private is one the interviewer doesn't get to find in public."
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
  { term: "RELIABILITY", desc: "Fault ≠ failure. Design fault tolerance. Expect human > software > hardware faults.", day: 1 },
  { term: "SCALABILITY", desc: "Define load parameters. Percentiles, not averages. Replicas scale reads. Partition only when proven.", day: 1 },
  { term: "MAINTAINABILITY", desc: "Operability + simplicity + evolvability. Modular monolith first.", day: 1 },
  { term: "DATA MODELS", desc: "Relational for relationships and invariants. Document/JSONB for flexible shapes.", day: 1 },
  { term: "STORAGE", desc: "B-tree: predictable reads, relational default. LSM: write-heavy. Indexes follow queries.", day: 2 },
  { term: "OLTP vs OLAP", desc: "Separate transactional and analytical workloads. Star schema for analytics.", day: 2 },
  { term: "SCHEMA EVOLUTION", desc: "Old and new code coexist. Add safely. Backfill. Tighten later.", day: 2 },
  { term: "REPLICATION", desc: "Replicas: reads + availability. Lag creates stale-read semantics. Route freshness-sensitive reads to primary.", day: 3 },
  { term: "PARTITIONING", desc: "Solves scale limits. Creates routing + rebalancing + cross-partition complexity. Last responsible moment.", day: 3 },
  { term: "OUTBOX", desc: "Local tx + outbox + idempotent consumers > distributed transactions. Always.", day: 3 },
  { term: "TRANSACTIONS", desc: "Weakest isolation that protects the invariant. Atomic updates > locks > serializable.", day: 4 },
  { term: "IDEMPOTENCY", desc: "Retries happen. Design for them. Every retriable write needs an idempotency story.", day: 4 },
  { term: "DISTRIBUTED", desc: "Networks, clocks, processes lie. CAP applies during partitions. Fencing tokens > naive locks.", day: 5 },
  { term: "CONSISTENCY", desc: "Eventual ≠ linearizable ≠ serializable. Strong consistency only where invariants demand it.", day: 5 },
  { term: "DERIVED DATA", desc: "Cache, search, analytics are derived. Source of truth is clear. Projections are rebuildable.", day: 6 },
  { term: "CAPSTONE", desc: "Monolith first. Local tx + outbox. Strong consistency only where invariants demand. Partition when proven.", day: 7 },
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
