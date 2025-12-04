const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    // 1. Get a user (we need a valid ID)
    // We'll try to find one by email or just pick the first one
    const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (fetchError || !users || users.length === 0) {
        console.error('Error fetching users or no users found:', fetchError);
        return;
    }

    const user = users[0];
    console.log('Testing update for user:', user.id, user.name);

    // 2. Try to update the name
    const newName = user.name + ' (Updated)';
    console.log('Attempting to update name to:', newName);

    const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ name: newName })
        .eq('id', user.id)
        .select()
        .single();

    if (updateError) {
        console.error('Update failed:', updateError);
    } else {
        console.log('Update successful:', updatedUser);
    }
}

run();
