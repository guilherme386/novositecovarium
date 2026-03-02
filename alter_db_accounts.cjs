const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();

        // 1. Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS server_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                permanent_password_hash TEXT NOT NULL,
                two_factor_secret TEXT,
                two_factor_enabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'server_users' created or verified.");

        // 2. Create recovery codes table
        await client.query(`
            CREATE TABLE IF NOT EXISTS recovery_codes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES server_users(id) ON DELETE CASCADE,
                code VARCHAR(20) NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Table 'recovery_codes' created or verified.");

        // 3. Update forum_posts to link to users and add image support
        await client.query(`
            ALTER TABLE forum_posts
            ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES server_users(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS image_url TEXT;
        `);
        console.log("Table 'forum_posts' updated.");

    } catch (err) {
        console.error("Database setup error:", err);
    } finally {
        await client.end();
    }
}

run();
