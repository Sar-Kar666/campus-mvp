const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testComment() {
    console.log('Testing comment insertion...');

    // 1. Get a valid user (sarkar)
    const { data: users } = await supabase.from('users').select('id').eq('username', 'sarkar').single();
    if (!users) {
        console.error('User "sarkar" not found');
        return;
    }
    const userId = users.id;

    // 2. Get a valid photo
    const { data: photos } = await supabase.from('photos').select('id').limit(1).single();
    if (!photos) {
        console.error('No photos found');
        return;
    }
    const photoId = photos.id;

    console.log(`Attempting to comment on photo ${photoId} as user ${userId}...`);

    // 3. Insert comment
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            photo_id: photoId,
            user_id: userId,
            content: 'Test comment from diagnostic script'
        }])
        .select();

    if (error) {
        console.error('Error inserting comment:', error);
    } else {
        console.log('Success! Comment inserted:', data);
    }
}

testComment();
