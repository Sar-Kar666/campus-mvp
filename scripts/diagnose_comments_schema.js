const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking "comments" table schema...');

    // Try to insert a dummy comment with parent_id (will fail if column missing)
    // Actually, safer to just select it if there's data, or check information_schema if possible (but we might not have permissions)
    // Let's try to select parent_id from comments

    const { data: comments, error: selectError } = await supabase
        .from('comments')
        .select('parent_id')
        .limit(1);

    if (selectError) {
        console.error('Error selecting parent_id:', selectError);
        if (selectError.message.includes('does not exist')) {
            console.log('\nCONCLUSION: The "parent_id" column is MISSING in the "comments" table.');
            console.log('Please run "scripts/add_comment_replies.sql".');
        }
    } else {
        console.log('Success! "parent_id" column exists.');
    }
}

checkSchema();
