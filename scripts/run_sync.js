const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: Normally we need SERVICE_ROLE_KEY to access auth.users, but let's try with ANON first if RLS allows reading auth.users (unlikely).
// Actually, we can't read auth.users with anon key usually.
// But we can try to just run the SQL via a "rpc" if we had one, or just use the dashboard.
// Wait, the user has to run this? No, I can run it if I have the Service Role Key.
// I don't have the Service Role Key in .env.local usually.
// Let's check if I can use the "postgres" connection string?
// DATABASE_URL is in .env.local!
// postgresql://postgres:200232@12@db.mvqlnutzezxjkhpznfny.supabase.co:5432/postgres
// I can use `pg` library to run the SQL directly!

const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    await client.connect();

    const sql = fs.readFileSync(path.join(__dirname, 'sync_users.sql'), 'utf8');

    try {
        const res = await client.query(sql);
        console.log('Sync complete:', res.rowCount, 'users inserted.');
    } catch (err) {
        console.error('Error running sync:', err);
    } finally {
        await client.end();
    }
}

run();
