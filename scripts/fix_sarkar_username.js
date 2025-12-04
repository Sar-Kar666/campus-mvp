const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUsername() {
    console.log('Updating username for "sarkar" to "sarkar"...');

    // 1. Get the user ID
    const { data: users, error: searchError } = await supabase
        .from('users')
        .select('id')
        .eq('name', 'sarkar')
        .limit(1);

    if (searchError || !users || users.length === 0) {
        console.error('User not found:', searchError);
        return;
    }

    const userId = users[0].id;

    // 2. Update the username
    const { data, error } = await supabase
        .from('users')
        .update({ username: 'sarkar' })
        .eq('id', userId)
        .select();

    if (error) {
        console.error('Error updating username:', error);
    } else {
        console.log('Success! Username updated:', data);
    }
}

updateUsername();
