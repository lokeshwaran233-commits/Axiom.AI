/*
  # Move vector extension from public to extensions schema

  1. Security
    - The `vector` extension was installed in the `public` schema, which exposes
      its types and functions to all database users and can conflict with application tables.
    - Moving it to the `extensions` schema follows Supabase best practices and
      aligns with where other extensions (pgcrypto, uuid-ossp, pg_stat_statements)
      are already installed.
  2. Changes
    - Drop the `embedding` column from `literature_chunks` (0 rows, no data loss)
    - Drop the `vector` extension from the `public` schema
    - Recreate the `vector` extension in the `extensions` schema
    - Re-add the `embedding` column to `literature_chunks` using the
      schema-qualified type `extensions.vector`
  3. Important Notes
    - The `literature_chunks` table has 0 rows, so dropping and re-adding the
      column causes no data loss.
    - After the migration, the vector type is accessed as `extensions.vector`.
    - Any future vector columns should use `extensions.vector(1536)` as the type.
*/

-- Step 1: Remove the dependent column (table has 0 rows, no data loss)
ALTER TABLE literature_chunks DROP COLUMN IF EXISTS embedding;

-- Step 2: Drop the extension from public schema
DROP EXTENSION IF EXISTS vector;

-- Step 3: Recreate the extension in the extensions schema
CREATE EXTENSION vector WITH SCHEMA extensions;

-- Step 4: Re-add the embedding column using the schema-qualified type
ALTER TABLE literature_chunks ADD COLUMN embedding extensions.vector(1536);
