const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('Diagnosing Comments Table with Anon Key...');

    // 1. Check if tables exist by trying to select from them
    // We expect an error if the table doesn't exist.
    // We might get an empty list or RLS error if it does exist.

    const { data: likesData, error: likesError } = await supabase.from('likes').select('count').limit(1);

    if (likesError) {
        console.error('❌ Error accessing "likes" table:', likesError.message);
        if (likesError.message.includes('does not exist') || likesError.code === '42P01') {
            console.error('   -> CONCLUSION: The "likes" table DOES NOT EXIST.');
        } else {
            console.error('   -> CONCLUSION: Table might exist, but access is denied (RLS) or other error.');
        }
    } else {
        console.log('✅ "likes" table exists and is accessible (public read).');
    }

    const { data: commentsData, error: commentsError } = await supabase.from('comments').select('count').limit(1);

    if (commentsError) {
        console.error('❌ Error accessing "comments" table:', commentsError.message);
        if (commentsError.message.includes('does not exist') || commentsError.code === '42P01') {
            console.error('   -> CONCLUSION: The "comments" table DOES NOT EXIST.');
        } else {
            console.error('   -> CONCLUSION: Table might exist, but access is denied (RLS) or other error.');
        }
    } else {
        console.log('✅ "comments" table exists and is accessible (public read).');
    }

    if ((likesError && likesError.code === '42P01') || (commentsError && commentsError.code === '42P01')) {
        console.log('\n⚠️  ACTION REQUIRED: You must run the SQL migration script to create the tables.');
    }
}

diagnose();
