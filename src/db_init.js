const fs = require('fs');
const path = require('path');
require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set. Set it in .env to initialize DB.');
  process.exit(1);
}
const { Pool } = require('pg');
const pool = new Pool({ connectionString: DATABASE_URL });

(async ()=>{
  const sql = fs.readFileSync(path.join(__dirname,'..','sql','init.sql'),'utf8');
  try {
    await pool.query(sql);
    console.log('DB initialized');
  } catch (err) {
    console.error('DB init error', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
