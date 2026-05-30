const fs   = require('fs');
const path = require('path');

const url    = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
  console.error('Copy .env.example to .env and fill in the values, then run: node scripts/build.js');
  process.exit(1);
}

const template = fs.readFileSync(path.join(__dirname, '../js/auth.template.js'), 'utf8');
const output   = template
  .replace('%%SUPABASE_URL%%', url)
  .replace('%%SUPABASE_ANON_KEY%%', anonKey);

fs.writeFileSync(path.join(__dirname, '../js/auth.js'), output);
console.log('Built js/auth.js');
