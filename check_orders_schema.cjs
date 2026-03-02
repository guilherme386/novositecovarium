const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
        console.log("Columns in 'orders' table:");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
