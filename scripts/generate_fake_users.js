const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const COLLEGES = ['TIT', 'ICFAI', 'Techno', 'JIS', 'KIIT', 'VIT', 'LPU'];
const BRANCHES = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'AIML', 'BBA', 'MBA'];
const YEARS = ['1st', '2nd', '3rd', '4th'];

const NAMES = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Angel', 'Myra', 'Sara'
];

const SURNAMES = [
    'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Saxena', 'Mehta', 'Chopra', 'Singh', 'Das',
    'Patel', 'Joshi', 'Reddy', 'Nair', 'Kapoor', 'Khan', 'Kumar', 'Yadav', 'Mishra', 'Pandey'
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function generateUsers() {
    console.log('Starting user generation...');
    let count = 0;

    for (const college of COLLEGES) {
        for (const branch of BRANCHES) {
            for (const year of YEARS) {
                // Generate 1 user per combination to avoid too much spam, or maybe 2?
                // Let's do 1 for now, that's 7 * 8 * 4 = 224 users. That's plenty.

                const firstName = getRandomElement(NAMES);
                const lastName = getRandomElement(SURNAMES);
                const name = `${firstName} ${lastName}`;
                const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
                const email = `${username}@example.com`;

                const user = {
                    id: crypto.randomUUID(), // Generate a random UUID
                    name: name,
                    username: username,
                    email: email,
                    college: college,
                    branch: branch,
                    year: year,
                    bio: `Student at ${college} studying ${branch}.`,
                    interests: ['Coding', 'Music', 'Travel'],
                    profile_image: `https://ui-avatars.com/api/?name=${name}&background=random`
                };

                const { error } = await supabase
                    .from('users')
                    .insert([user]);

                if (error) {
                    console.error(`Error inserting ${username}:`, error.message);
                } else {
                    console.log(`Inserted: ${name} (${college}, ${branch}, ${year})`);
                    count++;
                }
            }
        }
    }

    console.log(`Finished! Inserted ${count} users.`);
}

generateUsers();
