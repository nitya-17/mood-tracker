-- ====================================================================
-- Mood Tracker Database Schema
-- Compatible with PostgreSQL 14+ / Supabase
-- ====================================================================

-- Enable pgcrypto / uuid-ossp if needed (built into Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    timezone VARCHAR(64) DEFAULT 'UTC' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Fixed Catalog of Feelings
CREATE TABLE IF NOT EXISTS feelings (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Mood Entries Table
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    mood SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
    sleep_hours NUMERIC(4, 2) NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    reflection TEXT NOT NULL CHECK (char_length(reflection) >= 1 AND char_length(reflection) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_entry_date UNIQUE (user_id, entry_date)
);

-- Index for time-series lookups & ordering
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON mood_entries (user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_user_date_asc ON mood_entries (user_id, entry_date ASC);

-- 4. Entry Feelings (Many-to-Many Junction)
CREATE TABLE IF NOT EXISTS entry_feelings (
    entry_id UUID NOT NULL REFERENCES mood_entries(id) ON DELETE CASCADE,
    feeling_id INT NOT NULL REFERENCES feelings(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, feeling_id)
);

CREATE INDEX IF NOT EXISTS idx_entry_feelings_entry_id ON entry_feelings (entry_id);

-- 5. User Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    time_of_day TIME NOT NULL DEFAULT '20:00:00',
    enabled BOOLEAN NOT NULL DEFAULT true,
    channel VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'push', 'sms')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Quotes Table (categorized by mood level 1-5)
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    mood_level SMALLINT NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
    text TEXT NOT NULL,
    author VARCHAR(100) DEFAULT 'Unknown' NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quotes_mood ON quotes (mood_level);

-- 7. Weekly Summaries (for Long-Term Retention Roll-ups)
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    avg_mood NUMERIC(3, 2) NOT NULL,
    avg_sleep NUMERIC(4, 2) NOT NULL,
    entry_count INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_week_start UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week ON weekly_summaries (user_id, week_start DESC);
