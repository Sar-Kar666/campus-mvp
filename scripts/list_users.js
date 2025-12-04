const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    console.log('Listing users...');

    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, username')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Users:', users);
    }
}

listUsers();
