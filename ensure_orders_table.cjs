const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                minecraft_nick VARCHAR(255) NOT NULL,
                discord_nick VARCHAR(255) NOT NULL,
                product_id VARCHAR(255) NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                price NUMERIC(10,2) NOT NULL,
                clan_tag VARCHAR(100),
                tip NUMERIC(10,2) DEFAULT 0,
                message TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                transaction_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table 'orders' verified/created.");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
