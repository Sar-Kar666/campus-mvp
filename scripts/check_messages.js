const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessages() {
    console.log('Checking messages table...');

    // Try to insert a dummy message
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Messages table accessible.');
        if (data.length > 0) {
            console.log('Sample message:', data[0]);
        }
    }
}

checkMessages();
