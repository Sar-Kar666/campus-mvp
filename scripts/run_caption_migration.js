const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: 'postgres://postgres:postgres@localhost:54322/postgres',
});

async function run() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'add_caption_column.sql'), 'utf8');
        await client.query(sql);
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
