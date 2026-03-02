const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function diagnose() {
    await client.connect();
    console.log("Connected.");

    console.log("Checking server_users for 'role'...");
    try {
        await client.query("SELECT role FROM server_users LIMIT 1");
        console.log("server_users HAS role.");
    } catch (e) {
        console.log("server_users DOES NOT have role: " + e.message);
    }

    console.log("Checking staff for 'role'...");
    try {
        await client.query("SELECT role FROM staff LIMIT 1");
        console.log("staff HAS role.");
    } catch (e) {
        console.log("staff DOES NOT have role: " + e.message);
    }

    await client.end();
}
diagnose().catch(console.error);
