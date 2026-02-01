const { Client } = require('pg');
require('dotenv').config({ path: './.env' });
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='Request' ORDER BY ordinal_position;");
  console.log(res.rows);
  await client.end();
})().catch(err => { console.error(err); process.exit(1); });
