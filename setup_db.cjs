const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
    connectionString,
});

async function setup() {
    await client.connect();

    console.log("Conectado ao Neon DB!");

    // Tabela do Staff
    await client.query(`
    CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      minecraft_nick VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log("Tabela staff verificada/criada.");

    // Tabela de Noticias
    await client.query(`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      is_event BOOLEAN DEFAULT false,
      event_time TIMESTAMP,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log("Tabela news verificada/criada.");

    // Tabela de Posts do Fórum
    await client.query(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL, -- 'denuncia' ou 'geral'
      author VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log("Tabela forum_posts verificada/criada.");

    // Tabela de Extensões de Produtos (Tags e Timers)
    await client.query(`
    CREATE TABLE IF NOT EXISTS product_settings (
      product_id VARCHAR(255) PRIMARY KEY,
      is_clan_tag BOOLEAN DEFAULT false,
      timer_enabled BOOLEAN DEFAULT false,
      expires_at TIMESTAMP
    );
  `);
    console.log("Tabela product_settings verificada/criada.");

    await client.end();
    console.log("Configuração concluída!");
}

setup().catch(console.error);
