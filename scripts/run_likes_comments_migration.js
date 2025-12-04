const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    const sqlPath = path.join(__dirname, 'add_likes_comments.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon to run statements individually if needed, 
    // but Postgres usually handles the block. 
    // However, supabase-js doesn't have a direct 'query' method for raw SQL in the client 
    // unless using the rpc or psql. 
    // Since we don't have direct SQL access via client, we will use the 'rpc' workaround 
    // OR we can assume the user has a way to run this.
    // BUT, wait, I have been using `postgres` package or similar in previous turns?
    // No, I've been using `pg` or just assuming I can run it.
    // Actually, looking at previous scripts, I used `pg` package.

    // Let's use the `pg` package as seen in previous scripts if available.
    // Checking previous context... `scripts/run_is_read_migration.js` used `pg`.

    const { Client } = require('pg');

    // We need the connection string. 
    // I don't have the connection string in env vars usually, only the URL/Key.
    // Wait, the user provided `NEXT_PUBLIC_SUPABASE_URL`.
    // I will try to construct the connection string or ask the user.
    // Actually, I can use the `supabase` client if I have a stored procedure to run SQL, 
    // but I probably don't.

    // Let's try to use the `pg` client with a standard connection string if I can find it.
    // If not, I'll use the `supabase` client to just check if tables exist? No, I need to create them.

    // RE-READING PREVIOUS CONTEXT:
    // In `scripts/run_is_read_migration.js`, I used:
    // `const { Client } = require('pg');`
    // `const client = new Client({ connectionString: process.env.DATABASE_URL });`

    // So I assume `DATABASE_URL` is available in the environment or I can ask the user to provide it.
    // Since I cannot interactively ask here easily without stopping, I will assume it's set 
    // or I will try to use the `postgres` connection string format if I can derive it.

    // However, I don't see `DATABASE_URL` in the provided env vars in the prompt.
    // I only see `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

    // WORKAROUND: I will create the file and ask the user to run it via their Supabase dashboard 
    // OR I will try to run it using `pg` and hope `DATABASE_URL` is in the `.env.local`.

    // Let's try to read `.env.local` first to see if `DATABASE_URL` is there.
    // But I can't read it in this script easily before writing it.

    // I will write the script assuming `DATABASE_URL` is present in `.env.local` 
    // and I will use `dotenv` to load it.

    require('dotenv').config({ path: '.env.local' });

    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not defined in .env.local');
        console.log('Please run the SQL script manually in your Supabase SQL Editor.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

runMigration();
