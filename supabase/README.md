# Supabase Database Setup

This directory contains all database migrations and setup scripts for the L.E.A.P application.

## Prerequisites

- Supabase CLI installed
- Supabase project created
- Environment variables configured

## Installation

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

## Running Migrations

### Apply All Migrations

```bash
supabase db push
```

### Apply Specific Migration

```bash
supabase db push --file migrations/001_initial_schema.sql
```

### Reset Database (Development Only)

```bash
supabase db reset
```

## Migration Files

1. `001_initial_schema.sql` - Creates all tables
2. `002_indexes.sql` - Creates performance indexes
3. `003_rls_policies.sql` - Sets up Row Level Security
4. `004_functions_triggers.sql` - Creates functions and triggers

## Manual Setup (Alternative)

If you prefer to run migrations manually:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste each migration file in order
4. Execute each script

## Verification

After running migrations, verify the setup:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies;
```

## Storage Setup

Create storage buckets in Supabase Dashboard:

1. Go to Storage
2. Create bucket: `documents` (private)
3. Create bucket: `profile-photos` (public)

## Initial Admin User

After first user signup, promote to admin:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

## Backup

### Create Backup

```bash
supabase db dump -f backup.sql
```

### Restore Backup

```bash
supabase db reset
psql -h your-host -U postgres -d postgres -f backup.sql
```

## Troubleshooting

### Migration Fails

```bash
# Check migration status
supabase migration list

# Repair migration history
supabase migration repair
```

### RLS Issues

```sql
-- Disable RLS temporarily (development only)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Permission Errors

Ensure your Supabase user has proper permissions:

```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## Development Workflow

1. Make schema changes in new migration file
2. Test locally with `supabase db reset`
3. Apply to staging: `supabase db push`
4. Verify changes
5. Apply to production

## Best Practices

- Always create new migration files, never edit existing ones
- Test migrations locally before applying to production
- Keep migrations small and focused
- Document complex migrations
- Backup before major changes
- Use transactions for multi-step migrations

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
