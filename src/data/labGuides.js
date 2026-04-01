export const LAB_GUIDES = {
  1: [
    {
      task: "Prerequisites & Environment Setup",
      steps: [
        {
          title: "Install .NET 8 SDK",
          text: "This course uses .NET 8 (LTS). Download and install from the official site. After installation, verify from your terminal:",
          code: `dotnet --version
# Should output 8.0.x (e.g. 8.0.303)`,
          lang: "Bash"
        },
        {
          title: "Install PostgreSQL 16",
          text: "Download PostgreSQL 16 from https://www.postgresql.org/download/ and run the installer. During setup:\n- Choose a superuser password (remember it)\n- Keep the default port 5432\n- Optionally install pgAdmin 4 (graphical client)\n\nAfter installation, verify PostgreSQL is running:",
          code: `psql --version
# Should output: psql (PostgreSQL) 16.x

# Connect to the default database
psql -U postgres
# Enter your password when prompted`,
          lang: "Bash"
        },
        {
          title: "Create the OrderFlow database",
          text: "Inside psql (or pgAdmin), create a fresh database for this course:",
          code: `CREATE DATABASE orderflow;

-- Connect to it
\\c orderflow

-- Verify you're connected
SELECT current_database();
-- Should output: orderflow`,
          lang: "SQL"
        },
        {
          title: "Scaffold the .NET Web API project",
          text: "Create a minimal API project and add the Npgsql package (the .NET PostgreSQL driver):",
          code: `dotnet new webapi -n OrderFlow.Api --use-minimal-apis
cd OrderFlow.Api
dotnet add package Npgsql`,
          lang: "Bash"
        },
        {
          title: "Configure the connection string",
          text: "Open appsettings.json and add your PostgreSQL connection string. Replace the password with the one you set during PostgreSQL installation:",
          code: `{
  "ConnectionStrings": {
    "Default": "Host=localhost;Port=5432;Database=orderflow;Username=postgres;Password=YOUR_PASSWORD"
  }
}`,
          lang: "JSON"
        },
        {
          title: "Wire the connection string in Program.cs",
          text: "Read the connection string at startup so all endpoints can use it:",
          code: `var builder = WebApplication.CreateBuilder(args);
var connStr = builder.Configuration
    .GetConnectionString("Default")!;
var app = builder.Build();`,
          lang: "C#"
        }
      ]
    },
    {
      task: "Create orders, order_items, products tables in PostgreSQL",
      steps: [
        {
          title: "Create the products table",
          text: "Products are the catalog items. Use TEXT for the ID so you can use readable SKUs. The attributes_json column gives you document-like flexibility within a relational model — exactly the hybrid approach from section 1.4.",
          code: `CREATE TABLE products (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    price           NUMERIC(10,2) NOT NULL,
    stock_quantity  INT NOT NULL DEFAULT 0,
    attributes_json JSONB NOT NULL DEFAULT '{}'
);`,
          lang: "SQL"
        },
        {
          title: "Create the orders table",
          text: "Orders reference a customer and track status. Using UUID as the primary key avoids sequential guessing and works well across distributed systems later.",
          code: `CREATE TABLE orders (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id    TEXT NOT NULL,
    total_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'Pending',
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
          lang: "SQL"
        },
        {
          title: "Create the order_items join table",
          text: "This links orders to products with quantity and a snapshot of the price at time of purchase. The foreign keys enforce referential integrity — the relational guarantee from section 1.4.",
          code: `CREATE TABLE order_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID NOT NULL REFERENCES orders(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity   INT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL
);`,
          lang: "SQL"
        },
        {
          title: "Verify the tables exist",
          code: `\\dt
-- Should list: orders, order_items, products`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Seed 100 products",
      steps: [
        {
          title: "Generate seed data with a SQL loop",
          text: "Use generate_series to create 100 products with varying prices. This gives you enough data to see real query patterns.",
          code: `INSERT INTO products (id, name, price, stock_quantity, attributes_json)
SELECT
    'PROD-' || LPAD(i::TEXT, 4, '0'),
    'Product ' || i,
    ROUND((RANDOM() * 99 + 1)::NUMERIC, 2),
    (RANDOM() * 500)::INT,
    jsonb_build_object(
        'category', CASE (i % 4)
            WHEN 0 THEN 'electronics'
            WHEN 1 THEN 'clothing'
            WHEN 2 THEN 'books'
            ELSE 'home'
        END,
        'weight_kg', ROUND((RANDOM() * 10)::NUMERIC, 2)
    )
FROM generate_series(1, 100) AS i;`,
          lang: "SQL"
        },
        {
          title: "Verify the seed",
          text: "Quick sanity check — you should see 100 rows with varied prices and categories.",
          code: `SELECT COUNT(*) FROM products;
-- Should output: 100

SELECT id, name, price, stock_quantity FROM products LIMIT 5;`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Add endpoint to create an order and fetch by ID",
      steps: [
        {
          title: "Add the create-order endpoint to Program.cs",
          text: "This endpoint inserts an order and its items in a single transaction. Note how we use a transaction to keep the order and items atomic — if any item insert fails, nothing is committed.",
          code: `app.MapPost("/orders", async (CreateOrderRequest req) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var tx = await conn.BeginTransactionAsync();

    var orderId = Guid.NewGuid();
    decimal total = 0;

    foreach (var item in req.Items)
    {
        total += item.Quantity * item.UnitPrice;
    }

    await using (var cmd = new NpgsqlCommand(
        @"INSERT INTO orders (id, customer_id, total_amount)
          VALUES (@id, @cid, @total)", conn, tx))
    {
        cmd.Parameters.AddWithValue("id", orderId);
        cmd.Parameters.AddWithValue("cid", req.CustomerId);
        cmd.Parameters.AddWithValue("total", total);
        await cmd.ExecuteNonQueryAsync();
    }

    foreach (var item in req.Items)
    {
        await using var cmd = new NpgsqlCommand(
            @"INSERT INTO order_items
              (order_id, product_id, quantity, unit_price)
              VALUES (@oid, @pid, @qty, @price)", conn, tx);
        cmd.Parameters.AddWithValue("oid", orderId);
        cmd.Parameters.AddWithValue("pid", item.ProductId);
        cmd.Parameters.AddWithValue("qty", item.Quantity);
        cmd.Parameters.AddWithValue("price", item.UnitPrice);
        await cmd.ExecuteNonQueryAsync();
    }

    await tx.CommitAsync();
    return Results.Created(
        $"/orders/{orderId}", new { id = orderId });
});

record CreateOrderRequest(
    string CustomerId, List<OrderItemRequest> Items);
record OrderItemRequest(
    string ProductId, int Quantity, decimal UnitPrice);`,
          lang: "C#"
        },
        {
          title: "Add the get-order-by-ID endpoint",
          text: "Fetch the order header and its items in one round-trip using a JOIN. This demonstrates the relational model's strength — one query, referential integrity guaranteed.",
          code: `app.MapGet("/orders/{id:guid}", async (Guid id) =>
{
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();

    await using var cmd = new NpgsqlCommand(
        @"SELECT o.id, o.customer_id, o.total_amount,
                 o.status, o.created_at_utc,
                 oi.product_id, oi.quantity, oi.unit_price
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          WHERE o.id = @id", conn);
    cmd.Parameters.AddWithValue("id", id);

    await using var reader = await cmd.ExecuteReaderAsync();
    // Map rows to your response DTO
    // First row gives you the order header;
    // all rows give you line items
    return Results.Ok(/* mapped result */);
});`,
          lang: "C#"
        },
        {
          title: "Run and test the API",
          text: "Start the API and send a test request:",
          code: `# Terminal 1 — start the API
dotnet run

# Terminal 2 — create an order
curl -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "C1",
    "items": [{
      "productId": "PROD-0001",
      "quantity": 2,
      "unitPrice": 9.99
    }]
  }'
# Should return: {"id":"<some-guid>"}`,
          lang: "Bash"
        }
      ]
    },
    {
      task: "Record request latencies and print p50/p95/p99",
      steps: [
        {
          title: "Add the LatencyTracker class",
          text: "Create a new file LatencyTracker.cs in your project. This is the same tracker from section 1.2. It collects latency samples and computes percentiles — the exact metrics interviewers expect you to reason about.",
          code: `using System.Collections.Concurrent;

public sealed class LatencyTracker
{
    private readonly ConcurrentBag<double> _samples = new();

    public void Record(double ms) => _samples.Add(ms);

    public LatencyReport Snapshot()
    {
        var sorted = _samples.OrderBy(x => x).ToArray();
        if (sorted.Length == 0)
            return new(0, 0, 0, 0, 0, 0);
        return new(sorted.Length,
            P(sorted, .50), P(sorted, .95),
            P(sorted, .99), P(sorted, .999),
            sorted[^1]);
    }

    static double P(double[] s, double p) =>
        s[Math.Clamp(
            (int)Math.Ceiling(p * s.Length) - 1,
            0, s.Length - 1)];
}

public record LatencyReport(
    int Count, double P50, double P95,
    double P99, double P999, double Max);`,
          lang: "C#"
        },
        {
          title: "Register and wire it as middleware in Program.cs",
          text: "Register the tracker as a singleton and wrap each request in a Stopwatch. Add this before your endpoint definitions:",
          code: `using System.Diagnostics;

builder.Services.AddSingleton<LatencyTracker>();

var app = builder.Build();

// Latency-tracking middleware
app.Use(async (ctx, next) =>
{
    var sw = Stopwatch.StartNew();
    await next();
    sw.Stop();
    ctx.RequestServices
       .GetRequiredService<LatencyTracker>()
       .Record(sw.Elapsed.TotalMilliseconds);
});`,
          lang: "C#"
        },
        {
          title: "Add a metrics endpoint",
          text: "Expose the percentiles so you can check them after sending traffic:",
          code: `app.MapGet("/metrics/latency",
    (LatencyTracker tracker) =>
{
    var report = tracker.Snapshot();
    return Results.Ok(report);
});`,
          lang: "C#"
        },
        {
          title: "Send traffic and check results",
          text: "Generate some requests, then hit the metrics endpoint to see your percentiles:",
          code: `# Send 50 orders
for i in $(seq 1 50); do
  curl -s -X POST http://localhost:5000/orders \\
    -H "Content-Type: application/json" \\
    -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}]}'
done

# Check percentiles
curl -s http://localhost:5000/metrics/latency | jq
# Expected output:
# {
#   "count": 50,
#   "p50": 1.23,
#   "p95": 4.56,
#   "p99": 8.90,
#   "p999": 12.34,
#   "max": 15.67
# }`,
          lang: "Bash"
        }
      ]
    }
  ],

  2: [
    {
      task: "Prerequisites for Day 2",
      steps: [
        {
          title: "Verify your Day 1 setup is working",
          text: "You need the OrderFlow database with the orders, order_items, and products tables from Day 1. Verify:"
        },
        {
          title: "Check your tables have data",
          code: `\\c orderflow

SELECT COUNT(*) FROM products;   -- Should be 100
SELECT COUNT(*) FROM orders;     -- Should have some rows`,
          lang: "SQL"
        },
        {
          title: "Install Dapper (micro-ORM)",
          text: "Dapper is a lightweight ORM for .NET that maps SQL results directly to C# objects. Unlike Entity Framework, Dapper gives you full control over your SQL while removing boilerplate mapping code. Install it in your project:",
          code: `cd OrderFlow.Api
dotnet add package Dapper`,
          lang: "Bash"
        },
        {
          title: "Seed more orders for meaningful EXPLAIN results",
          text: "Day 2 exercises need enough rows to make index differences visible. Seed 10,000+ orders:",
          code: `INSERT INTO orders (customer_id, total_amount, status)
SELECT
    'CUST-' || LPAD((RANDOM() * 1000)::INT::TEXT, 4, '0'),
    ROUND((RANDOM() * 500)::NUMERIC, 2),
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN 'Pending'
        WHEN 1 THEN 'Shipped'
        ELSE 'Delivered'
    END
FROM generate_series(1, 50000);

SELECT COUNT(*) FROM orders;
-- Should be 50,000+`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Run EXPLAIN ANALYZE with and without an index — compare buffers",
      steps: [
        {
          title: "Query without an index",
          text: "First, run a filtered query and look at how PostgreSQL plans it. Without an index on customer_id, it performs a sequential scan — reading every single row:",
          code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE customer_id = 'CUST-0042';`,
          lang: "SQL"
        },
        {
          title: "Read the output",
          text: "Look for these key pieces:\n- 'Seq Scan on orders' — means full table scan\n- 'Buffers: shared hit=N read=M' — total 8KB pages touched\n- 'actual time=X..Y' — execution time in ms\n\nWrite down the buffer count — this is your baseline."
        },
        {
          title: "Create a B-tree index and re-run",
          text: "Now add an index and run the exact same query:",
          code: `CREATE INDEX idx_orders_customer_id
ON orders(customer_id);

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders
WHERE customer_id = 'CUST-0042';`,
          lang: "SQL"
        },
        {
          title: "Compare the results",
          text: "You should see:\n- 'Index Scan' instead of 'Seq Scan'\n- Far fewer buffers (e.g. 5 instead of 500)\n- Much faster execution time\n\nThis is the B-tree advantage from section 3.1 — O(log n) lookups instead of O(n) scans."
        }
      ]
    },
    {
      task: "Compare insert speed before and after adding two indexes",
      steps: [
        {
          title: "Enable timing in psql",
          code: `\\timing on`,
          lang: "SQL"
        },
        {
          title: "Drop extra indexes to get a clean baseline",
          text: "Keep only the primary key index. Remove the one we just created:",
          code: `DROP INDEX IF EXISTS idx_orders_customer_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created;`,
          lang: "SQL"
        },
        {
          title: "Insert a batch and note the time",
          text: "With only the primary key index, writes are fast:",
          code: `INSERT INTO orders (customer_id, total_amount, status)
SELECT
    'CUST-' || LPAD((RANDOM() * 1000)::INT::TEXT, 4, '0'),
    ROUND((RANDOM() * 500)::NUMERIC, 2),
    'Pending'
FROM generate_series(1, 10000);
-- Note the time (e.g. "Time: 85.432 ms")`,
          lang: "SQL"
        },
        {
          title: "Add two secondary indexes",
          code: `CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at_utc);`,
          lang: "SQL"
        },
        {
          title: "Insert the same batch size again and compare",
          text: "Each row now updates three indexes (PK + 2 secondary). You should see measurably slower inserts — this is the write amplification cost interviewers want you to acknowledge.",
          code: `INSERT INTO orders (customer_id, total_amount, status)
SELECT
    'CUST-' || LPAD((RANDOM() * 1000)::INT::TEXT, 4, '0'),
    ROUND((RANDOM() * 500)::NUMERIC, 2),
    'Pending'
FROM generate_series(1, 10000);
-- Compare: typically 20-50% slower with extra indexes`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Implement keyset pagination with Dapper",
      steps: [
        {
          title: "Add the using statement for Dapper",
          text: "In your Program.cs or wherever you define endpoints, add:",
          code: `using Dapper;`,
          lang: "C#"
        },
        {
          title: "Create the DTO",
          text: "Dapper maps SQL columns directly to C# properties. The property names must match the SQL column names (or aliases).",
          code: `record OrderDto(
    Guid Id,
    string Customer_Id,
    decimal Total_Amount,
    string Status,
    DateTime Created_At_Utc);`,
          lang: "C#"
        },
        {
          title: "Implement keyset (cursor) pagination",
          text: "Instead of OFFSET (which scans and discards rows), use a WHERE clause on the last seen value. This stays O(log n) regardless of page depth because PostgreSQL seeks directly via the index.",
          code: `app.MapGet("/orders", async (
    DateTime? after,
    int limit = 20) =>
{
    await using var conn = new NpgsqlConnection(connStr);

    const string sql = @"
        SELECT id, customer_id, total_amount,
               status, created_at_utc
        FROM orders
        WHERE (@after IS NULL
               OR created_at_utc < @after)
        ORDER BY created_at_utc DESC
        LIMIT @limit";

    var orders = (await conn.QueryAsync<OrderDto>(
        sql,
        new { after, limit = Math.Min(limit, 100) }
    )).ToList();

    var nextCursor = orders.Count == limit
        ? orders[^1].Created_At_Utc
        : (DateTime?)null;

    return Results.Ok(new { data = orders, nextCursor });
});`,
          lang: "C#"
        },
        {
          title: "Create the supporting index",
          text: "Keyset pagination needs an index that matches the ORDER BY clause:",
          code: `CREATE INDEX idx_orders_created_desc
ON orders(created_at_utc DESC);`,
          lang: "SQL"
        },
        {
          title: "Test it",
          code: `# First page
curl -s "http://localhost:5000/orders?limit=5" | jq

# Next page — use the nextCursor from the response
curl -s "http://localhost:5000/orders?limit=5&after=2024-01-15T10:30:00Z" | jq`,
          lang: "Bash"
        }
      ]
    },
    {
      task: "Add a nullable column safely and update the API contract",
      steps: [
        {
          title: "Add the column with a default",
          text: "Adding a nullable column with a default is a safe, non-blocking migration in PostgreSQL. Old rows get NULL, new rows get the default. No table rewrite needed.",
          code: `ALTER TABLE orders
ADD COLUMN notes TEXT DEFAULT NULL;

-- Verify it was added
\\d orders`,
          lang: "SQL"
        },
        {
          title: "Update the write path",
          text: "Update your create-order endpoint to accept and store the new field. Old clients that don't send it get NULL — no breaking change.",
          code: `// Updated request record — notes is optional
record CreateOrderRequest(
    string CustomerId,
    List<OrderItemRequest> Items,
    string? Notes = null);

// In the INSERT command, add the notes parameter:
await using (var cmd = new NpgsqlCommand(
    @"INSERT INTO orders
      (id, customer_id, total_amount, notes)
      VALUES (@id, @cid, @total, @notes)",
    conn, tx))
{
    cmd.Parameters.AddWithValue("id", orderId);
    cmd.Parameters.AddWithValue("cid", req.CustomerId);
    cmd.Parameters.AddWithValue("total", total);
    cmd.Parameters.AddWithValue("notes",
        (object?)req.Notes ?? DBNull.Value);
    await cmd.ExecuteNonQueryAsync();
}`,
          lang: "C#"
        },
        {
          title: "Update the read path",
          text: "Return the new field in responses. Old clients can ignore it — this is additive evolution, the safest kind of schema change (section 4.2).",
          code: `record OrderDto(
    Guid Id,
    string Customer_Id,
    decimal Total_Amount,
    string Status,
    DateTime Created_At_Utc,
    string? Notes);  // nullable — old orders won't have it`,
          lang: "C#"
        },
        {
          title: "Test both old and new formats",
          code: `# Old format — still works, notes will be null
curl -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}]}'

# New format — includes notes
curl -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}],"notes":"Rush order"}'`,
          lang: "Bash"
        }
      ]
    }
  ],

  3: [
    {
      task: "Prerequisites for Day 3",
      steps: [
        {
          title: "Verify your setup from Days 1-2",
          text: "You need the OrderFlow database and .NET project with Npgsql and Dapper from previous days. If you skipped Day 2's Dapper install:",
          code: `cd OrderFlow.Api
dotnet add package Dapper`,
          lang: "Bash"
        },
        {
          title: "Ensure System.Text.Json is available",
          text: "System.Text.Json is built into .NET 8 — no extra install needed. Just add the using statement where needed:",
          code: `using System.Text.Json;`,
          lang: "C#"
        }
      ]
    },
    {
      task: "Add the outbox table and write one outbox record per order creation",
      steps: [
        {
          title: "Create the outbox table",
          text: "The outbox table stores events that need to be published. The key insight: writing to this table happens in the same transaction as the business write, making it atomic.",
          code: `CREATE TABLE outbox (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type TEXT NOT NULL,
    aggregate_id   TEXT NOT NULL,
    event_type     TEXT NOT NULL,
    payload        JSONB NOT NULL,
    created_at_utc TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at   TIMESTAMPTZ NULL
);

-- Partial index: only unpublished messages
CREATE INDEX idx_outbox_unpublished
ON outbox(created_at_utc)
WHERE published_at IS NULL;`,
          lang: "SQL"
        },
        {
          title: "Write the outbox record inside the order transaction",
          text: "Add the outbox INSERT inside the same transaction that creates the order. If the transaction commits, both the order and the event are persisted atomically. This is what makes outbox safer than dual write.",
          code: `// Add this INSIDE the existing transaction,
// after inserting order items but before CommitAsync:

await using (var cmd = new NpgsqlCommand(
    @"INSERT INTO outbox
      (aggregate_type, aggregate_id,
       event_type, payload)
      VALUES
      ('Order', @id::TEXT, 'OrderCreated',
       @payload::JSONB)", conn, tx))
{
    cmd.Parameters.AddWithValue("id",
        orderId.ToString());
    cmd.Parameters.AddWithValue("payload",
        JsonSerializer.Serialize(new
        {
            orderId,
            customerId = req.CustomerId,
            total,
            itemCount = req.Items.Count,
            createdAt = DateTime.UtcNow
        }));
    await cmd.ExecuteNonQueryAsync();
}

await tx.CommitAsync();`,
          lang: "C#"
        },
        {
          title: "Verify the outbox record was created",
          text: "Create an order and check that the outbox row appeared:",
          code: `SELECT id, event_type, payload, published_at
FROM outbox
ORDER BY created_at_utc DESC LIMIT 1;
-- published_at should be NULL (not yet published)`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Implement the background publisher (BackgroundService)",
      steps: [
        {
          title: "What is BackgroundService?",
          text: "BackgroundService is built into .NET 8's Microsoft.Extensions.Hosting — no extra package needed. It runs a long-lived task in the background alongside your API. Perfect for polling the outbox."
        },
        {
          title: "Create OutboxPublisher.cs",
          text: "This service polls the outbox for unpublished messages and marks them as published. In production you'd send them to a message broker (RabbitMQ, Kafka). For this lab, we just log them.",
          code: `using Dapper;
using Npgsql;

public class OutboxPublisher : BackgroundService
{
    private readonly string _connStr;
    private readonly ILogger<OutboxPublisher> _log;

    public OutboxPublisher(
        IConfiguration config,
        ILogger<OutboxPublisher> log)
    {
        _connStr = config
            .GetConnectionString("Default")!;
        _log = log;
    }

    protected override async Task ExecuteAsync(
        CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try { await PublishBatch(ct); }
            catch (Exception ex)
            {
                _log.LogError(ex,
                    "Outbox publish failed");
            }
            await Task.Delay(
                TimeSpan.FromSeconds(2), ct);
        }
    }

    private async Task PublishBatch(
        CancellationToken ct)
    {
        await using var conn =
            new NpgsqlConnection(_connStr);
        await conn.OpenAsync(ct);

        var messages =
            await conn.QueryAsync<OutboxMsg>(
            @"SELECT id, event_type, payload
              FROM outbox
              WHERE published_at IS NULL
              ORDER BY created_at_utc
              LIMIT 50");

        foreach (var msg in messages)
        {
            // In production: publish to broker here
            _log.LogInformation(
                "Publishing {Event}: {Payload}",
                msg.EventType, msg.Payload);

            await conn.ExecuteAsync(
                @"UPDATE outbox
                  SET published_at = now()
                  WHERE id = @Id",
                new { msg.Id });
        }
    }
}

record OutboxMsg(
    Guid Id, string EventType, string Payload);`,
          lang: "C#"
        },
        {
          title: "Register the service in Program.cs",
          text: "Add this line before var app = builder.Build():",
          code: `builder.Services
    .AddHostedService<OutboxPublisher>();`,
          lang: "C#"
        },
        {
          title: "Test it",
          text: "Start the app, create an order, and watch the console logs. Within 2 seconds you should see the publisher pick up and log the outbox message.",
          code: `dotnet run

# In another terminal, create an order:
curl -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}]}'

# Check the app's console output:
# "Publishing OrderCreated: {...}"

# Verify in the database:
psql -U postgres -d orderflow -c \\
  "SELECT id, published_at FROM outbox ORDER BY created_at_utc DESC LIMIT 1;"
# published_at should now have a timestamp`,
          lang: "Bash"
        }
      ]
    },
    {
      task: "Add read-routing that routes to primary for 5 seconds after a write",
      steps: [
        {
          title: "Create ReadRouting.cs",
          text: "The idea: after a user writes, route their reads to the primary for a short window to avoid stale reads. This is the 'read-your-writes' consistency pattern from section 5.2.",
          code: `using System.Collections.Concurrent;

public class ReadRouting
{
    private readonly ConcurrentDictionary<string, DateTime>
        _lastWrite = new();

    public void RecordWrite(string userId)
        => _lastWrite[userId] = DateTime.UtcNow;

    public string GetConnectionString(
        string userId,
        string primaryConn,
        string replicaConn)
    {
        if (_lastWrite.TryGetValue(userId, out var ts)
            && DateTime.UtcNow - ts
               < TimeSpan.FromSeconds(5))
        {
            return primaryConn;
        }
        return replicaConn;
    }
}`,
          lang: "C#"
        },
        {
          title: "Register and use in endpoints",
          text: "Register as singleton. Call RecordWrite after every mutation. Use GetConnectionString for read endpoints.",
          code: `// In Program.cs
builder.Services.AddSingleton<ReadRouting>();

// In POST /orders, after tx.CommitAsync():
var routing = app.Services
    .GetRequiredService<ReadRouting>();
routing.RecordWrite(req.CustomerId);

// In GET endpoints:
var readConn = routing.GetConnectionString(
    userId, connStr, replicaConnStr);`,
          lang: "C#"
        },
        {
          title: "Note on replicas",
          text: "If you don't have a replica running locally, that's okay — the code still works and demonstrates the pattern. In production, replicaConnStr would point to a read replica. The logic is what matters for interview discussions."
        }
      ]
    },
    {
      task: "Choose a partition key for orders and defend it",
      steps: [
        {
          title: "Analyze your query patterns",
          text: "List every query that touches the orders table and which column it filters on. This determines which partition key avoids cross-partition scatter."
        },
        {
          title: "Evaluate candidate keys",
          text: "Common candidates and their trade-offs:",
          code: `-- Option A: customer_id
-- + "Get orders for customer" is single-partition
-- + Decent distribution if customers are many
-- - "Get order by ID" needs scatter or secondary index
-- - Hot customers (power users) create hot partitions

-- Option B: order_id (hash)
-- + "Get order by ID" is single-partition
-- + Uniform distribution
-- - "Get orders for customer" needs scatter

-- Option C: date-based (created_at month)
-- + Range scans for reporting
-- - Hot partition on current month (all writes go there)`,
          lang: "SQL"
        },
        {
          title: "Write your defense",
          text: "Pick one and write a 3-sentence justification. Example:\n\n\"I'd partition by customer_id because our primary access pattern is per-customer order history. The risk is hot customers, but at our scale we don't have enough write volume per customer to create a real hotspot. For order-by-ID lookups, we'd maintain a global index or include the customer_id in the order URL.\""
        }
      ]
    }
  ],

  4: [
    {
      task: "Prerequisites for Day 4",
      steps: [
        {
          title: "Verify your setup",
          text: "You need the OrderFlow database with products and orders tables from Day 1. If you don't have them, go back to Day 1 Prerequisites first."
        },
        {
          title: "Open two terminal windows with psql",
          text: "Day 4 simulates concurrent transactions. You need two separate psql sessions connected to the same database:",
          code: `# Terminal 1
psql -U postgres -d orderflow

# Terminal 2 (separate terminal window)
psql -U postgres -d orderflow`,
          lang: "Bash"
        },
        {
          title: "Ensure PROD-0001 exists",
          code: `SELECT id, stock_quantity
FROM products
WHERE id = 'PROD-0001';
-- If no rows, re-run Day 1's seed step`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Simulate two concurrent purchases of the last item — watch it oversell",
      steps: [
        {
          title: "Set up a product with 1 item in stock",
          code: `UPDATE products
SET stock_quantity = 1
WHERE id = 'PROD-0001';

-- Verify
SELECT stock_quantity FROM products
WHERE id = 'PROD-0001';
-- Should show: 1`,
          lang: "SQL"
        },
        {
          title: "In Terminal 1 — start a transaction and read stock",
          code: `BEGIN;

SELECT stock_quantity
FROM products
WHERE id = 'PROD-0001';
-- Shows: 1

-- DON'T commit yet — switch to Terminal 2`,
          lang: "SQL"
        },
        {
          title: "In Terminal 2 — start a transaction and read stock",
          text: "Both sessions now see stock_quantity = 1 from their snapshots:",
          code: `BEGIN;

SELECT stock_quantity
FROM products
WHERE id = 'PROD-0001';
-- Also shows: 1`,
          lang: "SQL"
        },
        {
          title: "In Terminal 1 — decrement and commit",
          code: `UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE id = 'PROD-0001';

COMMIT;`,
          lang: "SQL"
        },
        {
          title: "In Terminal 2 — decrement and commit",
          code: `UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE id = 'PROD-0001';

COMMIT;`,
          lang: "SQL"
        },
        {
          title: "Check the result",
          text: "Stock is now -1. You've oversold. Both transactions read 1, both subtracted 1, and both committed. This is the lost update problem from section 7.2.",
          code: `SELECT stock_quantity FROM products
WHERE id = 'PROD-0001';
-- Result: -1  (oversold!)`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Fix it with atomic conditional update",
      steps: [
        {
          title: "Reset stock to 1",
          code: `UPDATE products
SET stock_quantity = 1
WHERE id = 'PROD-0001';`,
          lang: "SQL"
        },
        {
          title: "In both terminals — use a WHERE guard",
          text: "The fix: make the UPDATE conditional. The WHERE clause creates an atomic check-and-set — only one of the concurrent requests will match and decrement.",
          code: `-- Run this in BOTH terminals concurrently:
UPDATE products
SET stock_quantity = stock_quantity - 1
WHERE id = 'PROD-0001'
  AND stock_quantity > 0;

-- Winner sees: UPDATE 1  (1 row affected)
-- Loser sees:  UPDATE 0  (0 rows affected)`,
          lang: "SQL"
        },
        {
          title: "Verify — no overselling",
          code: `SELECT stock_quantity FROM products
WHERE id = 'PROD-0001';
-- Result: 0  (correct!)`,
          lang: "SQL"
        },
        {
          title: "Map this to C# application code",
          text: "Check ExecuteNonQueryAsync's return value to detect the loser:",
          code: `await using var cmd = new NpgsqlCommand(
    @"UPDATE products
      SET stock_quantity = stock_quantity - @qty
      WHERE id = @productId
        AND stock_quantity >= @qty", conn);
cmd.Parameters.AddWithValue("productId", productId);
cmd.Parameters.AddWithValue("qty", quantity);

var affected = await cmd.ExecuteNonQueryAsync();
if (affected == 0)
{
    return Results.Conflict("Out of stock");
}`,
          lang: "C#"
        }
      ]
    },
    {
      task: "Add an idempotency-key table for POST /orders",
      steps: [
        {
          title: "Create the idempotency keys table",
          text: "This stores a mapping from client-provided idempotency key to the response. If the same key arrives again, return the stored response without re-executing.",
          code: `CREATE TABLE idempotency_keys (
    key        TEXT PRIMARY KEY,
    response   JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
          lang: "SQL"
        },
        {
          title: "Update the create-order endpoint",
          text: "Check for an existing key before processing. Store the result after success. Both inside the same transaction for atomicity.",
          code: `app.MapPost("/orders", async (
    CreateOrderRequest req,
    HttpContext http) =>
{
    var idempotencyKey = http.Request
        .Headers["Idempotency-Key"]
        .FirstOrDefault();

    if (string.IsNullOrEmpty(idempotencyKey))
        return Results.BadRequest(
            "Idempotency-Key header required");

    await using var conn =
        new NpgsqlConnection(connStr);
    await conn.OpenAsync();

    // Check if already processed
    var existing =
        await conn.QueryFirstOrDefaultAsync<string>(
        @"SELECT response::TEXT
          FROM idempotency_keys
          WHERE key = @key",
        new { key = idempotencyKey });

    if (existing != null)
        return Results.Ok(
            JsonSerializer.Deserialize<object>(
                existing));

    // Process the order (same logic as before)
    await using var tx =
        await conn.BeginTransactionAsync();

    var orderId = Guid.NewGuid();
    // ... create order and items ...

    // Store idempotency record in same transaction
    await conn.ExecuteAsync(
        @"INSERT INTO idempotency_keys
          (key, response)
          VALUES (@key, @response::JSONB)",
        new {
            key = idempotencyKey,
            response = JsonSerializer.Serialize(
                new { id = orderId })
        }, tx);

    await tx.CommitAsync();
    return Results.Created(
        $"/orders/{orderId}",
        new { id = orderId });
});`,
          lang: "C#"
        }
      ]
    },
    {
      task: "Retry the same request and verify same outcome",
      steps: [
        {
          title: "Send the same request twice with the same key",
          text: "Both requests should return the same order ID. The second one doesn't create a new order — it returns the cached response.",
          code: `# First request — creates the order
curl -s -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-abc-123" \\
  -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}]}'
# Returns: {"id":"<some-guid>"}

# Retry with the SAME key
curl -s -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-abc-123" \\
  -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}]}'
# Returns the SAME {"id":"<some-guid>"}`,
          lang: "Bash"
        },
        {
          title: "Verify in the database",
          text: "Only one order was created despite two requests:",
          code: `-- Only 1 order for this key
SELECT COUNT(*) FROM orders
WHERE customer_id = 'C1';

-- The idempotency record
SELECT * FROM idempotency_keys
WHERE key = 'order-abc-123';`,
          lang: "SQL"
        }
      ]
    }
  ],

  5: [
    {
      task: "Prerequisites — Install Redis",
      steps: [
        {
          title: "Install Redis on your machine",
          text: "Redis is an in-memory data store used for caching, locks, and pub/sub. Choose your OS:\n\nWindows (via WSL2 — recommended):",
          code: `# If you don't have WSL2, install it first:
wsl --install

# Inside WSL2 (Ubuntu):
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start

# Verify it's running:
redis-cli ping
# Should output: PONG`,
          lang: "Bash"
        },
        {
          title: "Alternative: Install Redis via Docker",
          text: "If you have Docker Desktop installed, this is the easiest option:",
          code: `docker run -d --name redis \\
  -p 6379:6379 redis:7-alpine

# Verify:
docker exec redis redis-cli ping
# Should output: PONG`,
          lang: "Bash"
        },
        {
          title: "Alternative: Install Redis on macOS",
          code: `brew install redis
brew services start redis

redis-cli ping
# Should output: PONG`,
          lang: "Bash"
        },
        {
          title: "Add StackExchange.Redis to your .NET project",
          text: "StackExchange.Redis is the standard .NET client for Redis. Install it:",
          code: `cd OrderFlow.Api
dotnet add package StackExchange.Redis`,
          lang: "Bash"
        },
        {
          title: "Register Redis in Program.cs",
          text: "Add the connection multiplexer as a singleton so all endpoints share one connection:",
          code: `using StackExchange.Redis;

builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("localhost:6379"));`,
          lang: "C#"
        },
        {
          title: "Verify the connection works",
          text: "Add a quick health-check endpoint:",
          code: `app.MapGet("/health/redis", (
    IConnectionMultiplexer redis) =>
{
    var db = redis.GetDatabase();
    var pong = db.Ping();
    return Results.Ok(
        new { status = "ok", latency = pong.TotalMilliseconds });
});

// Test: curl http://localhost:5000/health/redis`,
          lang: "C#"
        }
      ]
    },
    {
      task: "Simulate a Redis lock with TTL expiry",
      steps: [
        {
          title: "Create RedisLock.cs",
          text: "SET NX with an expiry — the standard Redis lock pattern. The TTL prevents deadlocks if the holder crashes.",
          code: `using StackExchange.Redis;

public class RedisLock
{
    private readonly IDatabase _db;

    public RedisLock(IConnectionMultiplexer redis)
        => _db = redis.GetDatabase();

    public async Task<bool> AcquireAsync(
        string resource,
        string holder,
        TimeSpan ttl)
    {
        // SET key value EX ttl NX
        // NX = only set if key does not exist
        return await _db.StringSetAsync(
            $"lock:{resource}",
            holder,
            ttl,
            When.NotExists);
    }

    public async Task ReleaseAsync(
        string resource,
        string holder)
    {
        // Lua script: only delete if we still hold it
        var script = @"
            if redis.call('get', KEYS[1]) == ARGV[1]
            then
                return redis.call('del', KEYS[1])
            else
                return 0
            end";
        await _db.ScriptEvaluateAsync(script,
            new RedisKey[] { $"lock:{resource}" },
            new RedisValue[] { holder });
    }
}`,
          lang: "C#"
        },
        {
          title: "Test the lock",
          text: "Create a simple console test or an endpoint to verify acquire/release:",
          code: `app.MapPost("/test/lock", async (
    IConnectionMultiplexer redis) =>
{
    var lockMgr = new RedisLock(redis);
    var holder = Guid.NewGuid().ToString();

    var acquired = await lockMgr.AcquireAsync(
        "checkout:PROD-0001",
        holder,
        TimeSpan.FromSeconds(5));

    if (acquired)
    {
        // Simulate work
        await Task.Delay(100);
        await lockMgr.ReleaseAsync(
            "checkout:PROD-0001", holder);
        return Results.Ok("Lock acquired and released");
    }

    return Results.Conflict(
        "Lock held by another process");
});`,
          lang: "C#"
        }
      ]
    },
    {
      task: "Add a 'long pause' and show why naive lock semantics fail",
      steps: [
        {
          title: "Simulate a GC pause or slow operation",
          text: "The holder acquires the lock with a 3s TTL, then pauses for 5s (simulating a GC stop-the-world or slow network call). The lock expires while the holder thinks it still owns it.",
          code: `app.MapPost("/test/zombie-lock", async (
    IConnectionMultiplexer redis) =>
{
    var lockMgr = new RedisLock(redis);
    var holder = Guid.NewGuid().ToString();

    var acquired = await lockMgr.AcquireAsync(
        "checkout:PROD-0001",
        holder,
        TimeSpan.FromSeconds(3));

    if (!acquired)
        return Results.Conflict("Lock held");

    Console.WriteLine(
        "Lock acquired with 3s TTL");

    // Simulate a long GC pause or slow DB call
    await Task.Delay(
        TimeSpan.FromSeconds(5));

    // Lock has already expired!
    // Another process could have acquired it.
    Console.WriteLine(
        "Holder wakes up — thinks it has lock");
    Console.WriteLine(
        "Writing to shared resource... DANGER!");

    await lockMgr.ReleaseAsync(
        "checkout:PROD-0001", holder);
    // Release may silently fail — lock is owned
    // by someone else now

    return Results.Ok("Completed (unsafely)");
});`,
          lang: "C#"
        },
        {
          title: "Test with two concurrent requests",
          text: "Send the first request, then immediately send the second. The second will acquire the lock after the TTL expires — while the first is still 'working'.",
          code: `# Terminal 1 — starts the zombie holder
curl -X POST http://localhost:5000/test/zombie-lock &

# Wait 4 seconds (lock expired, holder still sleeping)
sleep 4

# Terminal 2 — acquires the same lock
curl -X POST http://localhost:5000/test/zombie-lock

# Watch the console: both think they have the lock!`,
          lang: "Bash"
        },
        {
          title: "Understand the problem",
          text: "This is the zombie process problem from section 8.4. The first holder's lock expired during its pause. The second holder acquired the lock legitimately. Now both think they own it and both write — causing data corruption."
        }
      ]
    },
    {
      task: "Add a fencing-token check",
      steps: [
        {
          title: "Create FencedLock.cs",
          text: "A fencing token is a monotonically increasing number. Every lock acquisition gets a higher token. The storage system rejects writes with stale tokens.",
          code: `using StackExchange.Redis;

public class FencedLock
{
    private readonly IDatabase _db;

    public FencedLock(IConnectionMultiplexer redis)
        => _db = redis.GetDatabase();

    public async Task<long?> AcquireAsync(
        string resource,
        string holder,
        TimeSpan ttl)
    {
        var acquired = await _db.StringSetAsync(
            $"lock:{resource}",
            holder, ttl, When.NotExists);

        if (!acquired) return null;

        // Increment a global fencing counter
        var token = await _db.StringIncrementAsync(
            $"fence:{resource}");
        await _db.StringSetAsync(
            $"lock:{resource}:token", token, ttl);

        return token;
    }
}`,
          lang: "C#"
        },
        {
          title: "Add a fencing column to the database",
          code: `ALTER TABLE products
ADD COLUMN last_fence_token BIGINT DEFAULT 0;`,
          lang: "SQL"
        },
        {
          title: "Check the token before writing",
          text: "The WHERE clause rejects writes with stale tokens. Even if a zombie holder wakes up, its old token is rejected:",
          code: `-- Only allow writes with a newer token
UPDATE products
SET stock_quantity = stock_quantity - 1,
    last_fence_token = @token
WHERE id = @productId
  AND last_fence_token < @token;

-- Returns 0 rows if token is stale
-- → zombie write blocked`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Write one paragraph on whether OrderFlow's search index should be linearizable",
      steps: [
        {
          title: "Think through the requirements",
          text: "Consider: does a user searching for products need to see the absolute latest stock count? What about a user searching for their just-placed order?"
        },
        {
          title: "Write your answer",
          text: "Example answer:\n\n\"OrderFlow's product search index does not need linearizability. A customer seeing a product listed as 'in stock' that was just sold out seconds ago is an acceptable trade-off — the checkout step will validate actual stock atomically. Eventual consistency with a lag of a few seconds is fine for search. However, order status for the customer who just placed it should use read-your-writes consistency (route to primary for a short window), because showing 'no orders found' right after checkout is a UX failure even though it's technically consistent.\""
        }
      ]
    }
  ],

  6: [
    {
      task: "Prerequisites for Day 6",
      steps: [
        {
          title: "Verify your outbox setup from Day 3",
          text: "Day 6 builds on the outbox pattern from Day 3. You need the outbox table and at least a few OrderCreated events in it:",
          code: `\\c orderflow

SELECT COUNT(*) FROM outbox
WHERE event_type = 'OrderCreated';
-- Should have some rows

-- If empty, go back to Day 3 and implement
-- the outbox write in your create-order endpoint`,
          lang: "SQL"
        },
        {
          title: "Ensure Dapper is installed",
          text: "The projection worker uses Dapper for clean SQL mapping. If you haven't installed it:",
          code: `cd OrderFlow.Api
dotnet add package Dapper`,
          lang: "Bash"
        }
      ]
    },
    {
      task: "Add an order_summaries table",
      steps: [
        {
          title: "Create the derived projection table",
          text: "This is a read-optimized view of order data. It's derived data — rebuilt from events, not the source of truth. This pattern is core to section 11's dataflow architecture.",
          code: `CREATE TABLE order_summaries (
    order_id       UUID PRIMARY KEY,
    customer_id    TEXT NOT NULL,
    total_amount   NUMERIC(10,2) NOT NULL,
    item_count     INT NOT NULL,
    status         TEXT NOT NULL,
    created_at_utc TIMESTAMPTZ NOT NULL,
    projected_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_summaries_customer
ON order_summaries(customer_id, created_at_utc DESC);`,
          lang: "SQL"
        },
        {
          title: "Verify the table",
          code: `\\d order_summaries`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "When an order is placed, emit an outbox message",
      steps: [
        {
          title: "Reuse the outbox from Day 3",
          text: "If you completed Day 3, you already have the outbox table and the write logic. The OrderCreated event you emit there is exactly what the summary worker will consume.\n\nIf you skipped Day 3, go back to Day 3 Lab Task 1 first."
        },
        {
          title: "Ensure the payload has everything the projection needs",
          text: "The projection needs: orderId, customerId, totalAmount, itemCount, status, and createdAt. Check an existing outbox record:",
          code: `SELECT payload
FROM outbox
WHERE event_type = 'OrderCreated'
ORDER BY created_at_utc DESC LIMIT 1;

-- Should contain all required fields:
-- orderId, customerId, total, itemCount, createdAt`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "A worker consumes the message and populates the summary",
      steps: [
        {
          title: "Create SummaryProjector.cs",
          text: "This BackgroundService reads published outbox messages and projects them into order_summaries. It transforms events into a read-optimized shape.",
          code: `using System.Text.Json;
using Dapper;
using Npgsql;

public class SummaryProjector : BackgroundService
{
    private readonly string _connStr;
    private readonly ILogger<SummaryProjector> _log;

    public SummaryProjector(
        IConfiguration config,
        ILogger<SummaryProjector> log)
    {
        _connStr = config
            .GetConnectionString("Default")!;
        _log = log;
    }

    protected override async Task ExecuteAsync(
        CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try { await ProjectBatch(ct); }
            catch (Exception ex)
            {
                _log.LogError(ex,
                    "Projection failed");
            }
            await Task.Delay(2000, ct);
        }
    }

    private async Task ProjectBatch(
        CancellationToken ct)
    {
        await using var conn =
            new NpgsqlConnection(_connStr);
        await conn.OpenAsync(ct);

        var messages =
            await conn.QueryAsync<OutboxMsg>(
            @"SELECT id, payload
              FROM outbox
              WHERE event_type = 'OrderCreated'
                AND published_at IS NOT NULL
              ORDER BY created_at_utc
              LIMIT 50");

        foreach (var msg in messages)
        {
            var evt = JsonSerializer
                .Deserialize<OrderCreatedEvt>(
                    msg.Payload,
                    new JsonSerializerOptions {
                        PropertyNameCaseInsensitive
                            = true
                    });

            await conn.ExecuteAsync(
                @"INSERT INTO order_summaries
                  (order_id, customer_id,
                   total_amount, item_count,
                   status, created_at_utc)
                  VALUES
                  (@OrderId, @CustomerId,
                   @Total, @ItemCount,
                   'Pending', @CreatedAt)
                  ON CONFLICT (order_id)
                  DO NOTHING",
                evt);

            _log.LogInformation(
                "Projected order {Id}",
                evt!.OrderId);
        }
    }
}

record OutboxMsg(Guid Id, string Payload);

record OrderCreatedEvt(
    Guid OrderId, string CustomerId,
    decimal Total, int ItemCount,
    DateTime CreatedAt);`,
          lang: "C#"
        },
        {
          title: "Register the worker in Program.cs",
          code: `builder.Services
    .AddHostedService<SummaryProjector>();`,
          lang: "C#"
        },
        {
          title: "Test the full pipeline",
          text: "Create an order → outbox publisher picks it up → summary projector reads the published event → order_summaries row appears.",
          code: `dotnet run

# Create an order
curl -s -X POST http://localhost:5000/orders \\
  -H "Content-Type: application/json" \\
  -d '{"customerId":"C1","items":[{"productId":"PROD-0001","quantity":1,"unitPrice":9.99}]}'

# Wait a few seconds for both workers to process

# Check the summary was created
psql -U postgres -d orderflow -c \\
  "SELECT * FROM order_summaries ORDER BY created_at_utc DESC LIMIT 1;"`,
          lang: "Bash"
        }
      ]
    },
    {
      task: "Re-run the same message and prove handling is idempotent",
      steps: [
        {
          title: "Understand why ON CONFLICT matters",
          text: "The INSERT ... ON CONFLICT (order_id) DO NOTHING in the projector ensures that re-processing the same event doesn't create duplicate summaries. This is idempotent consumption — section 11.3's key reliability property."
        },
        {
          title: "Count summaries before",
          code: `SELECT COUNT(*) FROM order_summaries;
-- Note this number`,
          lang: "SQL"
        },
        {
          title: "Force a re-process by resetting published_at",
          text: "In PostgreSQL, use a subquery to reset one specific message:",
          code: `UPDATE outbox
SET published_at = now()
WHERE id = (
    SELECT id FROM outbox
    WHERE event_type = 'OrderCreated'
    ORDER BY created_at_utc DESC
    LIMIT 1
);

-- Wait a few seconds for the projector...`,
          lang: "SQL"
        },
        {
          title: "Verify the count is unchanged",
          code: `SELECT COUNT(*) FROM order_summaries;
-- Should be the SAME as before — no duplicate`,
          lang: "SQL"
        }
      ]
    },
    {
      task: "Explain how you would rebuild the projection from scratch",
      steps: [
        {
          title: "Think through the rebuild process",
          text: "This is the rebuildability property from section 11. If the projection is wrong (bug, schema change, new derived field), you can throw it away and rebuild from the source events."
        },
        {
          title: "Write the rebuild steps",
          text: "Example answer:\n\n1. Stop the SummaryProjector worker\n2. TRUNCATE order_summaries (it's derived data — safe to delete)\n3. Reset published flags or use a separate replay mechanism\n4. Restart the projector — it replays all events and rebuilds the table\n5. Verify row counts match the source\n\nIn production, you'd use a separate consumer group offset or a replay flag rather than mutating the outbox. The principle is the same: derived data is disposable if you have the source events."
        }
      ]
    }
  ],

  7: [
    {
      task: "Prerequisites for Day 7",
      steps: [
        {
          title: "Prepare your recording setup",
          text: "Day 7 is practice day — no new code tools. You need:\n\n1. A voice recorder (phone app, or screen recording software like OBS)\n2. A timer (phone, browser, or the Speak Timer in this course)\n3. A whiteboard app or paper for drawing architecture diagrams\n4. Access to Claude (claude.ai) or ChatGPT for the mock interview"
        },
        {
          title: "Review your completed labs",
          text: "Before the capstone, make sure you've done at least Days 1-4 labs. Day 7 pulls together all concepts. If you skipped days, review the theory sections at minimum."
        }
      ]
    },
    {
      task: "Give a full 30-min system design answer out loud — record yourself",
      steps: [
        {
          title: "Set up your environment",
          text: "Start your voice recorder. Set a timer for 30 minutes. Pretend you're in a real interview — no pausing to look things up."
        },
        {
          title: "Follow this structure",
          text: "1. Requirements & Clarifications (3-5 min): State assumptions about scale, write/read ratio, latency goals, consistency needs, region setup.\n\n2. High-Level Design (5-7 min): Draw/describe the main components — API, database, async processing, read path. Start with a modular monolith.\n\n3. Deep Dives (15-18 min): Walk through the write path (transactions, outbox), read path (replication, caching), and failure handling (idempotency, fencing). Reference specific DDIA concepts.\n\n4. Evolution & Trade-offs (3-5 min): Where would you partition? When would you add a cache? What would break first at 10x scale?"
        },
        {
          title: "Record and listen back",
          text: "Listen for filler words, vague phrases ('it depends'), and missed trade-off discussions. These are the weak spots to fix."
        }
      ]
    },
    {
      task: "Identify 3 weak spots from your answer and review those days",
      steps: [
        {
          title: "Score yourself on these dimensions",
          text: "Rate 1-5 on each:\n- Clarity: Did you explain simply, or ramble?\n- Trade-offs: Did you state pros AND cons, or just pick a tool?\n- Correctness: Did you state DDIA concepts accurately?\n- Practicality: Did you ground answers in real code/patterns?\n- Depth: Could you go deeper when challenged?"
        },
        {
          title: "Map weak areas to course days",
          text: "- Weak on consistency/isolation → Review Day 4\n- Weak on replication/partitioning → Review Day 3\n- Vague about failure modes → Review Day 5\n- Fuzzy on derived data / async → Review Day 6\n- Can't articulate basics clearly → Review Day 1"
        }
      ]
    },
    {
      task: "Run a mock interview with Claude using the Mega Prompt",
      steps: [
        {
          title: "Copy the Mega Prompt",
          text: "Navigate to the 'One Day Plan' page in the sidebar and find the Mega Prompt. Copy the entire prompt."
        },
        {
          title: "Open Claude or ChatGPT",
          text: "Go to claude.ai (or chatgpt.com). Paste the Mega Prompt and press Enter. The AI will start interviewing you."
        },
        {
          title: "Run the interview seriously",
          text: "Treat it like a real interview. Don't look at notes. Answer each follow-up question fully before moving on. The AI will push back on vague answers — that's the point."
        },
        {
          title: "Ask for a grade at the end",
          text: "After the mock interview, ask:\n\n\"Grade my performance on a scale of 1-10 for each: technical depth, communication clarity, trade-off awareness, practical grounding. What were my top 3 weaknesses?\""
        }
      ]
    },
    {
      task: "Complete the Failure-First Review on your design",
      steps: [
        {
          title: "Ask these 5 questions about your design",
          text: "For the system you designed in the mock interview, answer each:\n\n1. What happens when the database is down for 30 seconds? Which requests fail? Which succeed from cache? Is there data loss?\n\n2. What happens when a message is delivered twice? Does the consumer handle it idempotently? Where could duplicates cause business harm?\n\n3. What happens when a replica is 10 seconds behind? Which user-facing features show stale data? Is that acceptable? Where do you need read-your-writes?\n\n4. What happens when two users modify the same resource simultaneously? Is there a race condition? What invariant could break? How do you prevent it?\n\n5. What happens when you need to change the schema of a high-traffic table? Can you do it without downtime? What's your migration strategy?"
        },
        {
          title: "Write your answers down",
          text: "Use the Personal Notes section for this day. These failure-mode answers are exactly what strong candidates discuss proactively in interviews."
        }
      ]
    }
  ]
}
