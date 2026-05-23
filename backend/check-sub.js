const p = require('./config/database');
async function main() {
  const r = await p.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='subscriptions' ORDER BY ordinal_position");
  console.log(JSON.stringify(r.rows, null, 2));
  await p.end();
}
main().catch(e => { console.error(e); process.exit(1); });
