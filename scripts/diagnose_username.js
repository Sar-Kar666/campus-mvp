const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsername() {
    console.log('Checking if "username" column exists in "users" table...');

    // Try to select the username column
    const { data, error } = await supabase
        .from('users')
        .select('username')
        .limit(1);

    if (error) {
        console.error('Error selecting username:', error);
        console.log('\nCONCLUSION: The "username" column likely does NOT exist or is not accessible.');
        console.log('Please run the "scripts/add_username_column.sql" migration script in your Supabase SQL Editor.');
    } else {
        console.log('Success! "username" column exists.');
        console.log('Sample data:', data);
    }
}

checkUsername();
