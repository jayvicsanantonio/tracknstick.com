-- Drops the bookkeeping tables of the knex setup that came before wrangler migrations.
-- No code reads them; wrangler records applied migrations in d1_migrations instead.

DROP TABLE IF EXISTS knex_migrations_lock;
DROP TABLE IF EXISTS knex_migrations;
