const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();
        const res = await client.query('SELECT status, count(*) FROM orders GROUP BY status');
        console.log("Order counts by status:");
        console.table(res.rows);

        const lastOrders = await client.query('SELECT id, minecraft_nick, product_name, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
        console.log("\nLast 5 orders:");
        console.table(lastOrders.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
