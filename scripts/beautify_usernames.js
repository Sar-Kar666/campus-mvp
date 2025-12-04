const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function beautifyUsernames() {
    console.log('Fetching users...');
    const { data: users, error } = await supabase.from('users').select('*');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    for (const user of users) {
        // Skip if username is already "nice" (doesn't start with user_)
        // Or just update everyone to be safe/consistent
        if (!user.name) continue;

        let newUsername = user.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

        // Add random suffix if needed? For now, let's try clean names.
        // If collision, we might fail, but let's try.

        // Check if it looks like a default username
        if (user.username && user.username.startsWith('user_')) {
            console.log(`Updating ${user.name} (${user.username}) -> ${newUsername}`);

            const { error: updateError } = await supabase
                .from('users')
                .update({ username: newUsername })
                .eq('id', user.id);

            if (updateError) {
                console.error(`Failed to update ${user.name}:`, updateError.message);
                // Fallback: append random string
                const fallback = `${newUsername}${Math.floor(Math.random() * 1000)}`;
                console.log(`Retrying with ${fallback}`);
                await supabase.from('users').update({ username: fallback }).eq('id', user.id);
            } else {
                console.log('Success!');
            }
        } else {
            console.log(`Skipping ${user.name} (${user.username}) - already looks custom`);
        }
    }
}

beautifyUsernames();
