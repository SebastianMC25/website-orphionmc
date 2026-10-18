-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE, -- For recovery
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'user', 'moderator', 'staff', 'admin'
    two_factor_secret TEXT,
    two_factor_enabled INTEGER DEFAULT 0,
    minecraft_ign TEXT, -- For detailed avatar/skin
    minecraft_uuid TEXT UNIQUE, -- Official MC UUID
    discord_id TEXT UNIQUE, -- Official Discord User ID
    discord_username TEXT,
    discord_avatar TEXT,
    avatar_url TEXT,
    last_login DATETIME,
    last_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    view_order INTEGER DEFAULT 0,
    type TEXT DEFAULT 'general' -- 'announcement', 'general', 'guide', 'support', 'suggestion'
);

-- Threads Table
CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT, -- Optional if we want to store first post content here for preview, or just rely on posts table
    prefix TEXT, -- [Mago], [Guerrero], etc.
    status TEXT DEFAULT 'open', -- 'open', 'closed', 'solved', 'accepted', 'rejected'
    is_pinned INTEGER DEFAULT 0,
    is_locked INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Posts Table (Replies + First Post)
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Thread Votes (For Suggestions)
CREATE TABLE IF NOT EXISTS thread_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    vote_value INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(thread_id, user_id),
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Minecraft Link Codes
CREATE TABLE IF NOT EXISTS link_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'reply', 'mention', 'system', 'staff'
    data TEXT, -- JSON data
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Initial Categories with Types
INSERT OR IGNORE INTO categories (name, description, view_order, type) VALUES 
('Anuncios Oficiales', 'Noticias importantes y actualizaciones del servidor.', 1, 'announcement'),
('Discusión General', 'Habla sobre cualquier tema relacionado con OrphionMC.', 2, 'general'),
('Guías de Clases', 'Aprende a dominar el arte del Guerrero, Mago y más.', 3, 'guide'),
('Soporte Técnico', '¿Tienes problemas? Pregunta aquí a la comunidad.', 4, 'support'),
('Sugerencias', 'Ayúdanos a mejorar el Olimpo con tus ideas.', 5, 'suggestion');
