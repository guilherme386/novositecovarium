const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'covarium_super_secret_key_123!'; // Em produção, usar process.env

const connectionString = 'postgresql://neondb_owner:npg_wo7WdLQeGFR2@ep-fragrant-base-ac7mf77f-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000
});

// Global error handlers to prevent "freezing" or crashing
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});


// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ========================
// RECURSOS DE AUTENTICAÇÃO E CONTA
// ========================

// 1. Registro
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, permanent_password } = req.body;

    try {
        // Verificar se usuário existe
        const userCheck = await pool.query('SELECT * FROM server_users WHERE email = $1 OR username = $2', [email, username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email ou username já cadastrados.' });
        }

        // Hashear senhas
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const permanent_password_hash = await bcrypt.hash(permanent_password, salt);

        // Criar usuário
        const result = await pool.query(
            'INSERT INTO server_users (username, email, password_hash, permanent_password_hash) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
            [username, email, password_hash, permanent_password_hash]
        );
        const user = result.rows[0];

        // Gerar 10 códigos de recuperação
        const codes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
        for (const code of codes) {
            await pool.query('INSERT INTO recovery_codes (user_id, code) VALUES ($1, $2)', [user.id, code]);
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user, recovery_codes: codes });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password, token2fa } = req.body;

    try {
        const result = await pool.query('SELECT * FROM server_users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const user = result.rows[0];

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Obter perfil com checagem de Token
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, profile_picture_url, store_tags, active_tag, wallet_balance, created_at FROM server_users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.sendStatus(404);

        const user = result.rows[0];

        // Verificar se é staff/admin
        const staffResult = await pool.query('SELECT role FROM staff WHERE minecraft_nick = $1', [user.username]);
        user.role = user.username === 'admin' || user.username === 'ANJELINOBR' ? 'admin' : (staffResult.rows[0]?.role || 'user');

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Trocar senha comum (Exige a senha permanente)

// 7. Trocar senha comum (Exige a senha permanente)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    const { permanent_password, new_password } = req.body;
    try {
        const userCheck = await pool.query('SELECT permanent_password_hash FROM server_users WHERE id = $1', [req.user.id]);
        const validPassword = await bcrypt.compare(permanent_password, userCheck.rows[0].permanent_password_hash);

        if (!validPassword) return res.status(401).json({ error: 'Senha permanente incorreta.' });

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);

        await pool.query('UPDATE server_users SET password_hash = $1 WHERE id = $2', [password_hash, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Upload Foto de Perfil
app.post('/api/user/profile-picture', authenticateToken, upload.single('profile_picture'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
        const filePath = '/uploads/' + req.file.filename;

        // Atualizar banco
        try {
            await pool.query('UPDATE server_users SET profile_picture_url = $1 WHERE id = $2', [filePath, req.user.id]);
        } catch (e) {
            console.log("Erro ao salvar foto de perfil no db:", e.message);
        }

        res.json({ success: true, url: filePath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// RECURSOS DE CARTEIRA E GIFTS
// ========================

// 1. Resgatar Gift Card
app.post('/api/user/redeem-gift', authenticateToken, async (req, res) => {
    const { code } = req.body;
    try {
        const giftResult = await pool.query('SELECT * FROM gift_cards WHERE code = $1 AND status = \'available\'', [code]);
        if (giftResult.rows.length === 0) {
            return res.status(404).json({ error: 'Código inválido ou já resgatado.' });
        }

        const gift = giftResult.rows[0];

        // Iniciar transação
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Adicionar saldo
            await client.query('UPDATE server_users SET wallet_balance = wallet_balance + $1 WHERE id = $2', [gift.amount, req.user.id]);

            // Marcar gift como resgatado
            await client.query('UPDATE gift_cards SET status = \'redeemed\', redeemer_id = $1, redeemed_at = NOW() WHERE id = $2', [req.user.id, gift.id]);

            await client.query('COMMIT');
            res.json({ success: true, amount: gift.amount });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Checkout de Carrinho
app.post('/api/checkout', authenticateToken, async (req, res) => {
    const { items, useWallet } = req.body;
    console.log('--- CHECKOUT START ---');
    console.log('User:', req.user.username);
    console.log('Items:', JSON.stringify(items, null, 2));

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const total = items.reduce((acc, item) => acc + (Number(item.price) || 0) + (Number(item.tip) || 0), 0);
            console.log('Total:', total);

            if (useWallet) {
                const userRes = await client.query('SELECT wallet_balance FROM server_users WHERE id = $1', [req.user.id]);
                if (userRes.rows[0].wallet_balance < total) {
                    throw new Error('Saldo insuficiente na carteira.');
                }
                await client.query('UPDATE server_users SET wallet_balance = wallet_balance - $1 WHERE id = $2', [total, req.user.id]);
            }

            const orders = [];
            for (const item of items) {
                let giftCode = null;
                if (item.category_id === 'gift') {
                    giftCode = Math.random().toString(36).substring(2, 12).toUpperCase();
                    await client.query(
                        'INSERT INTO gift_cards (code, amount, creator_id) VALUES ($1, $2, $3)',
                        [giftCode, item.price, req.user.id]
                    );
                }

                console.log('Inserting order for:', item.name, 'Price:', item.price);
                const orderResult = await client.query(
                    `INSERT INTO orders (minecraft_nick, discord_nick, product_id, product_name, price, clan_tag, tip, message, status, transaction_id) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                    [
                        item.mcNick,
                        item.dcNick,
                        item.id,
                        item.name,
                        item.price,
                        item.clanTag || null,
                        item.tip || 0,
                        giftCode ? `GIFT CODE: ${giftCode}` : (item.message || null),
                        useWallet ? 'confirmed' : 'pending',
                        useWallet ? 'WALLET_PAYMENT' : item.transactionId || null
                    ]
                );
                orders.push(orderResult.rows[0]);
            }

            await client.query('COMMIT');
            console.log('--- CHECKOUT COMMIT SUCCESS ---');
            res.json({ success: true, orders });
        } catch (e) {
            console.error('--- CHECKOUT ROLLBACK ---');
            console.error(e);
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('--- CHECKOUT ERROR ---');
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Pegar Gifts criados por mim
app.get('/api/user/gifts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM gift_cards WHERE creator_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// RECURSOS DO STAFF
// ========================
app.get('/api/staff', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM staff ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/staff', async (req, res) => {
    const { name, role, minecraft_nick, photo_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO staff (name, role, minecraft_nick, photo_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, role, minecraft_nick, photo_url || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/staff/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// RECURSOS DAS NOTÍCIAS
// ========================
app.get('/api/news', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/news', async (req, res) => {
    const { title, description, is_event, event_time, expires_at } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO news (title, description, is_event, event_time, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, is_event, event_time || null, expires_at || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// RECURSOS DO FÓRUM
// ========================
app.get('/api/forum', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM forum_posts ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/forum', authenticateToken, async (req, res) => {
    const { type, title, content, image_url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO forum_posts (type, author, title, content, user_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [type, req.user.username, title, content, req.user.id, image_url || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/forum/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM forum_posts WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// RECURSOS DE PRODUTOS
// ========================
app.get('/api/products/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_settings');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware para verificar se o usuário é ADMIN
const isAdmin = async (req, res, next) => {
    try {
        // Se já verificamos o role no authenticateToken ou se é um dos admins conhecidos
        if (req.user.role === 'admin' || req.user.username === 'admin' || req.user.username === 'ANJELINOBR') {
            return next();
        }

        const staffResult = await pool.query('SELECT role FROM staff WHERE minecraft_nick = $1', [req.user.username]);

        if (staffResult.rows.length > 0 && staffResult.rows[0].role === 'admin') {
            next();
        } else {
            console.warn(`Admin access denied for user: ${req.user.username}`);
            res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ========================
// RECURSOS DE ADMIN (NOVO)
// ========================

// 1. Listar usuários
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, email, wallet_balance, store_tags, active_tag, created_at FROM server_users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Atualizar Tags de um usuário
app.post('/api/admin/users/:id/tags', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { tags, active_tag } = req.body;
    try {
        await pool.query(
            'UPDATE server_users SET store_tags = $1, active_tag = $2 WHERE id = $3',
            [JSON.stringify(tags || []), active_tag || null, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Criar cupom de desconto
app.post('/api/admin/coupons', authenticateToken, isAdmin, async (req, res) => {
    const { code, discount_percentage } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO coupons (code, discount_percentage) VALUES ($1, $2) RETURNING *',
            [code.toUpperCase(), discount_percentage]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Criar Gift Card manualmente
app.post('/api/admin/gifts', authenticateToken, isAdmin, async (req, res) => {
    const { amount } = req.body;
    try {
        const code = Math.random().toString(36).substring(2, 12).toUpperCase();
        const result = await pool.query(
            'INSERT INTO gift_cards (code, amount, creator_id) VALUES ($1, $2, $3) RETURNING *',
            [code, amount, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Listar todos os pedidos
app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Atualizar status de um pedido
app.patch('/api/admin/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Listar Categorias e Produtos (Loja)
app.get('/api/products/all', async (req, res) => {
    try {
        const categories = await pool.query('SELECT * FROM product_categories ORDER BY sort_order');
        const products = await pool.query('SELECT * FROM products ORDER BY sort_order');

        const data = categories.rows.map(cat => ({
            ...cat,
            products: products.rows.filter(p => p.category_id === cat.id)
        }));

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. CRUD de Categorias (Admin)
app.get('/api/admin/categories', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM product_categories ORDER BY sort_order');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/categories', authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, display_title, description, sort_order } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO product_categories (name, slug, display_title, description, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, slug, display_title, description || null, sort_order || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/admin/categories/:id', authenticateToken, isAdmin, async (req, res) => {
    const { name, slug, display_title, description, sort_order } = req.body;
    try {
        const result = await pool.query(
            'UPDATE product_categories SET name = $1, slug = $2, display_title = $3, description = $4, sort_order = $5 WHERE id = $6 RETURNING *',
            [name, slug, display_title, description, sort_order, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/categories/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM product_categories WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. CRUD de Produtos (Admin)
app.get('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY sort_order');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
    const { category_id, name, slug, price, description, features, highlight, is_active, sort_order } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (category_id, name, slug, price, description, features, highlight, is_active, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [category_id, name, slug, price, description, JSON.stringify(features || []), highlight || false, is_active !== false, sort_order || 0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
    const { category_id, name, slug, price, description, features, highlight, is_active, sort_order } = req.body;
    try {
        const result = await pool.query(
            'UPDATE products SET category_id = $1, name = $2, slug = $3, price = $4, description = $5, features = $6, highlight = $7, is_active = $8, sort_order = $9 WHERE id = $10 RETURNING *',
            [category_id, name, slug, price, description, JSON.stringify(features), highlight, is_active, sort_order, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products/settings', async (req, res) => {
    const { product_id, is_clan_tag, timer_enabled, expires_at } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO product_settings (product_id, is_clan_tag, timer_enabled, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (product_id) DO UPDATE SET
       is_clan_tag = EXCLUDED.is_clan_tag,
       timer_enabled = EXCLUDED.timer_enabled,
       expires_at = EXCLUDED.expires_at
       RETURNING *`,
            [product_id, is_clan_tag, timer_enabled, expires_at || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`\n================================`);
    console.log(`Servidor rodando em:`);
    console.log(`- Local: http://localhost:${PORT}`);

    // Log local IP addresses
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`- Network: http://${net.address}:${PORT}`);
            }
        }
    }
    console.log(`================================\n`);
});
