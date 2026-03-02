const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
async function check() {
    await client.connect();
    try {
        const res = await client.query("SELECT two_factor_secret FROM server_users LIMIT 1;");
        console.log("Column exists!");
    } catch (e) {
        console.log("Error querying:", e.message);
        try {
            await client.query("ALTER TABLE server_users ADD COLUMN two_factor_secret TEXT, ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;");
            console.log("Column added!");
        } catch (e2) { console.log(e2.message); }
    }
    await client.end();
}
check();
