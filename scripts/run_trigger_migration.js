const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = fs.readFileSync(path.join(__dirname, 'create_trigger.sql'), 'utf8');
        console.log('Executing SQL...');

        await client.query(sql);
        console.log('Trigger created successfully.');
    } catch (err) {
        console.error('Error creating trigger:', err);
    } finally {
        await client.end();
    }
}

run();
