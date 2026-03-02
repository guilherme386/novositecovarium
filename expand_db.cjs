const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();

        // 1. Add wallet column to users
        await client.query(`
            ALTER TABLE server_users 
            ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0.00;
        `);
        console.log("Column 'wallet_balance' added to 'server_users'.");

        // 2. Create gift_cards table
        await client.query(`
            CREATE TABLE IF NOT EXISTS gift_cards (
                id SERIAL PRIMARY KEY,
                code VARCHAR(255) UNIQUE NOT NULL,
                amount NUMERIC(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'available', -- 'available', 'redeemed'
                creator_id INTEGER REFERENCES server_users(id) ON DELETE SET NULL,
                redeemer_id INTEGER REFERENCES server_users(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                redeemed_at TIMESTAMP WITH TIME ZONE
            );
        `);
        console.log("Table 'gift_cards' created or verified.");

    } catch (err) {
        console.error("Database expansion error:", err);
    } finally {
        await client.end();
    }
}

run();
