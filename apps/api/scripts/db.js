// ABOUTME: Unified database management script for Cloudflare D1 operations
// ABOUTME: Handles migrations, local reset, seeding, and query operations

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_NAME = 'tracknstick-db';
const PROJECT_DIR = path.join(__dirname, '..');

// The seed file lives beside this script, not in migrations/. Wrangler applies
// every .sql file in migrations/ as a migration, production included.
const SEED_FILE = path.join(__dirname, 'seed.sql');

// Where wrangler keeps the local database that `wrangler dev` uses.
const LOCAL_STATE_DIR = path.join(PROJECT_DIR, '.wrangler', 'state');

// Get command line arguments
const [, , command, ...args] = process.argv;
const isRemote = args.includes('--remote');
const targetFlag = isRemote ? '--remote' : '--local';

// Helper function to execute wrangler commands
function executeWrangler(command, options = {}) {
  try {
    console.log(`🚀 Executing: ${command}`);
    const result = execSync(`pnpm exec wrangler ${command}`, {
      stdio: 'inherit',
      cwd: PROJECT_DIR,
      ...options,
    });
    return result;
  } catch (error) {
    console.error(`❌ Failed to execute: ${command}`);
    throw error;
  }
}

// Stops a command that must never touch the remote (production) database.
function requireLocal(commandName) {
  if (isRemote) {
    console.error(
      `❌ ${commandName} only runs against the local database. ` +
        'Production changes go through migration files: see migrations/README.md.'
    );
    process.exit(1);
  }
}

// Migrate: Apply every migration the database has not seen yet
async function migrate() {
  console.log(`📊 Running migrations ${isRemote ? '(REMOTE)' : '(LOCAL)'}`);

  executeWrangler(`d1 migrations apply ${DB_NAME} ${targetFlag}`);

  console.log('✅ Migrations applied!');
}

// Setup: Bring a database to the current schema, which is what migrate does
async function setup() {
  console.log(`🏗️  Setting up database ${isRemote ? '(REMOTE)' : '(LOCAL)'}`);

  await migrate();

  console.log('✅ Database setup complete!');
}

// Reset: Throw away the local database and rebuild it from the migrations
async function reset() {
  requireLocal('reset');

  console.log('🔄 Resetting database (LOCAL)');

  // Removing wrangler's local state is what empties the database. Unlike a
  // list of DROP TABLE statements, it cannot fall out of step with the schema.
  fs.rmSync(LOCAL_STATE_DIR, { recursive: true, force: true });
  console.log('🗑️  Local database removed');

  await migrate();

  console.log('✅ Database reset complete!');
}

// Seed: Add sample/test data
async function seed() {
  requireLocal('seed');

  console.log('🌱 Seeding database (LOCAL)');

  executeWrangler(`d1 execute ${DB_NAME} --file=${SEED_FILE} ${targetFlag}`);
  console.log('✅ Database seeded!');
}

// Query: Interactive query runner
async function query() {
  const sqlQuery = args.find((arg) => !arg.startsWith('--'));

  if (!sqlQuery) {
    console.log('❓ Usage: pnpm db:query "SELECT * FROM users" [--remote]');
    return;
  }

  console.log(
    `🔍 Executing query ${isRemote ? '(REMOTE)' : '(LOCAL)'}: ${sqlQuery}`
  );
  executeWrangler(
    `d1 execute ${DB_NAME} --command="${sqlQuery}" ${targetFlag}`
  );
}

// Show help
function showHelp() {
  console.log(`
📚 Database Management Commands:

  pnpm db:migrate        Apply pending migrations to the local database
  pnpm db:setup          Same as db:migrate, for a first-time setup
  pnpm db:reset          Delete the local database and rebuild it from the migrations
  pnpm db:seed           Add sample/test data to the local database
  pnpm db:query "SQL"    Execute a SQL query against the local database

Remote (production) operations:
  pnpm db:migrate:remote      Apply pending migrations to production
  pnpm db:query:remote "SQL"  Execute a SQL query against production

  reset and seed never run against production.

Examples:
  pnpm db:migrate
  pnpm db:query "SELECT COUNT(*) FROM habits"
  pnpm db:reset
`);
}

// Main execution
async function main() {
  try {
    switch (command) {
      case 'setup':
        await setup();
        break;
      case 'reset':
        await reset();
        break;
      case 'migrate':
        await migrate();
        break;
      case 'seed':
        await seed();
        break;
      case 'query':
        await query();
        break;
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
      default:
        console.log('❌ Unknown command:', command);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Database operation failed:', error.message);
    process.exit(1);
  }
}

main();
