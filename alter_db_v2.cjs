const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();

        await client.query(`
            ALTER TABLE server_users
            ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
            ADD COLUMN IF NOT EXISTS store_tags JSONB DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS active_tag VARCHAR(255);
        `);
        console.log("Table 'server_users' updated with profile picture and tags.");

    } catch (err) {
        console.error("Database setup error:", err);
    } finally {
        await client.end();
    }
}

run();
