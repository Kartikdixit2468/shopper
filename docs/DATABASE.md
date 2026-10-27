# Database architecture

## Decision

Supabase hosts the project's PostgreSQL database and provides Google authentication. Prisma is the only application data-access layer for merchant data. Supabase Auth owns identities and sessions in its managed `auth` schema; the application mirrors only the user's UUID, email, name, and avatar in a portable public `Profile` table.

The application does not use the Supabase Data API or Realtime for store data. This keeps the merchant-data layer portable to any compatible PostgreSQL host, including PostgreSQL on AWS EC2 or Amazon RDS, while authentication remains behind a small Supabase boundary.

## Connection variables

### `DATABASE_URL`

Used by the running Next.js application. Start with the **Session pooler** URL copied from the Supabase dashboard's Connect panel:

```text
postgresql://postgres.PROJECT_REF:DB_PASSWORD@POOLER_HOST:5432/postgres?sslmode=require&connection_limit=5
```

Do not invent the pooler hostname or username; copy the complete string from Supabase. URL-encode reserved characters in the password.

For a serverless deployment with many short-lived instances, use Supabase's transaction pooler on port `6543` and append `pgbouncer=true&connection_limit=1`. Transaction mode has limitations, so change modes only when the deployment architecture requires it.

### `DIRECT_URL`

Used by Prisma for migrations and administrative operations:

```text
postgresql://postgres:DB_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

Supabase direct connections require IPv6 unless the project has its IPv4 add-on. On an IPv4-only development machine, use the Session pooler URL for `DIRECT_URL` too.

Both variables are server secrets. Neither uses the `NEXT_PUBLIC_` prefix and neither may be returned to browser code or logs.

## Initial Supabase setup

1. Create a Supabase project and retain the database password in a password manager.
2. Copy `.env.example` to `.env.local` and replace all database placeholders.
3. Apply the committed migrations with `pnpm db:deploy`.
4. Generate the Prisma client with `pnpm db:generate`.
5. Run `pnpm db:validate`, then start the application.

For local schema development, `pnpm db:migrate` creates new migration files. For shared, staging, and production databases, use `pnpm db:deploy` so migration history is applied without interactive development behavior.

## Moving to AWS later

The portable unit is the PostgreSQL database and its Prisma migrations.

1. Provision a supported PostgreSQL version on EC2 or RDS.
2. Restrict inbound database traffic to the application and administration networks; require TLS.
3. Move existing data with standard PostgreSQL `pg_dump`/`pg_restore`, or use the migration files for a fresh database.
4. Point `DATABASE_URL` at the application's pooled or direct AWS connection.
5. Point `DIRECT_URL` at the administrative AWS connection.
6. Run `pnpm db:deploy`, restart the application, and verify login plus draft-store reads.

Because profiles, constraints, enums, and store data live in ordinary PostgreSQL tables, this move does not require replacing Prisma or application queries. Supabase Auth remains the identity provider after a database-only move. Replacing or self-hosting authentication later would require changing the isolated Supabase auth client and callback boundary, not the store repository.
