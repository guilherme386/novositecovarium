const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();
        await client.query('ALTER TABLE staff ADD COLUMN IF NOT EXISTS photo_url TEXT');
        console.log("Column photo_url added successfully.");
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
