const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const client = new Client({ connectionString });

async function run() {
    try {
        await client.connect();

        // 1. Categories
        await client.query(`
            CREATE TABLE IF NOT EXISTS product_categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                display_title VARCHAR(255) NOT NULL,
                description TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table 'product_categories' verified/created.");

        // 2. Products
        await client.query(`
            CREATE TABLE IF NOT EXISTS products (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                price NUMERIC(10,2) NOT NULL,
                description TEXT,
                features JSONB DEFAULT '[]',
                highlight BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table 'products' verified/created.");

        // 3. Seed initial categories if empty
        const catCheck = await client.query('SELECT count(*) FROM product_categories');
        if (parseInt(catCheck.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO product_categories (name, slug, display_title, description, sort_order) VALUES
                ('VIP', 'vip', 'PLANOS VIP', 'Escolha o plano ideal para sua jornada', 0),
                ('Tags', 'tags', 'CLAN TAGS', 'Personalize sua identidade', 1),
                ('Serviços', 'servicos', 'OUTROS SERVIÇOS', 'Unban e Unmute', 2)
            `);
            console.log("Default categories seeded.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
run();
