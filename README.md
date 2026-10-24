# 🌱 MoodPulse - Time-Series Mood Tracking & Analytics

> **Portfolio Pitch:** *"Built a full-stack mood tracking application with data visualization and trend analysis. Demonstrates proficiency in time-series data handling, analytics implementation using PostgreSQL window functions, and scheduled background jobs powered by Supabase."*

---

## 📌 Features

### Core Challenge Capabilities
- **Daily Reflection & Logging:** Log mood (1–5 scale), sleep hours (0–24), emotional feeling tags, and reflections (1–500 chars).
- **Today's Check-in & Dynamic Quote:** Surfaces today's active entry or a prompt to check in, paired with a mood-matched inspiration quote.
- **11-Bar Recent Graph (Chart.js):** Color-coded bars (1 = red, 5 = blue) with interactive hover and click inspection for instant daily drill-downs.
- **Trend Comparison:** Compares average mood and sleep from the past 5 check-ins against the previous 5 with trend badges (`+0.8 vs previous 5`) and indicators.
- **Calendar Heatmap & Gaps:** Visualizes historical consistency while rendering unlogged days as **empty dashed gaps**, never falsified as zero mood.
- **Profile & Settings:** Update display name, preset avatars, timezone selection, and customizable daily reminder schedules.
- **Data Export:** Instant one-click CSV and JSON exports.
- **Dual-Layer Validation:** Enforced both client-side (React Hook Form + Zod) and server-side (Express Zod middleware + PostgreSQL check & unique constraints).

---

## 🏛 Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Chart.js, Tailwind CSS, Lucide Icons | Responsive UI, time-series visualization, accessibility |
| **Backend** | Node.js, Express, Zod, Helmet, Morgan, Rate Limiting | RESTful API, authentication, server-side validation |
| **Database** | PostgreSQL 15+ hosted on **Supabase** | Relational schemas, date constraints, SQL window functions |
| **Authentication** | JWT (JSON Web Tokens) with bcrypt password hashing | Stateless cross-domain authentication |
| **Scheduler / Jobs** | Render Cron / GitHub Actions webhook calling `/jobs/*` | Timezone-aware reminders & data retention rollups |

---

## 📐 Database Schema & Time-Series Design

```sql
users (id UUID, email, password_hash, name, avatar_url, timezone, created_at)
feelings (id SERIAL, label UNIQUE)
mood_entries (id UUID, user_id, entry_date DATE, mood SMALLINT, sleep_hours NUMERIC(4,2), reflection TEXT, created_at)
  └── UNIQUE(user_id, entry_date)
entry_feelings (entry_id, feeling_id)
reminders (id UUID, user_id UNIQUE, time_of_day, enabled, channel)
quotes (id SERIAL, mood_level, text, author)
weekly_summaries (id UUID, user_id, week_start DATE, avg_mood, avg_sleep, entry_count)
```

### Key Time-Series Decision: The "Midnight Problem"
* Entries store `entry_date` as a **PostgreSQL `DATE`** calculated from the user's stored IANA `timezone`, rather than a naive UTC timestamp.
* This ensures that an entry logged at 11:30 PM locally remains attributed to that local day, rather than spilling over into tomorrow UTC.
* A database constraint `UNIQUE(user_id, entry_date)` guarantees only one entry per user per calendar day.

---

## 📊 Time-Series Questions Answered

### 1. How do you efficiently query for trends across months?
* Index `mood_entries` on `(user_id, entry_date DESC)`.
* Query only the active date window rather than scanning entire tables.
* Pre-aggregate higher-order trends using `date_trunc('week' | 'month', entry_date)` or roll older data into `weekly_summaries` table.

### 2. How do you handle missing days?
* Use `generate_series(start_date, end_date, interval '1 day')` and `LEFT JOIN mood_entries`.
* Unlogged days return `NULL` values and are explicitly rendered as **empty dashed gaps** in the heatmap and bar chart, avoiding the severe analytics trap of treating missing entries as a "0" mood.

### 3. How do you visualize patterns over different time periods?
* **Short Term (7–14 days):** Daily discrete bars showing mood and sleep hours.
* **Medium Term (1–3 months):** Calendar heatmap, day-of-week aggregations via `EXTRACT(DOW)`, and rolling 5-entry moving averages.
* **Long Term (3+ months):** Weekly and monthly rollups (`weekly_summaries`).

---

## 🚀 Local Setup & Installation

### 1. Configure Supabase Database
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** -> **Database** and copy your **Connection string (URI)**.
3. Replace `[YOUR-PASSWORD]` with your database password.

### 2. Configure Environment Variables
Create `.env` in the root workspace (or copy `.env.example`):
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set:
```ini
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
PORT=5001
CLIENT_URL=http://localhost:5173
```

### 3. Run Database Setup & Seeding
From the root directory:
```bash
# Apply schema to Supabase
npm run db:setup

# Seed feelings catalog, quotes, and 30 days of demo data
npm run db:seed
```

### 4. Start Development Servers
```bash
# Starts both Express API (:5001) and React Client (:5173)
npm run dev
```

### 5. Instant Demo Credentials
* **Email:** `demo@moodtracker.app`
* **Password:** `password123`
*(Or click the 1-click **Instant Demo Account** button on the sign-in screen)*

---

## 🛡 API Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Create user account |
| `POST` | `/api/auth/login` | No | Login and obtain JWT token |
| `GET` | `/api/auth/me` | Bearer | Get current user profile |
| `PATCH` | `/api/auth/me` | Bearer | Update name, avatar preset, timezone |
| `GET` | `/api/entries/today` | Bearer | Get today's check-in in user's timezone |
| `POST` | `/api/entries` | Bearer | Submit check-in (mood, sleep, feelings, reflection) |
| `GET` | `/api/entries?limit=11` | Bearer | Most recent entries for bar chart |
| `GET` | `/api/entries?from=&to=&include_gaps=true` | Bearer | Continuous time series via `generate_series` |
| `GET` | `/api/quotes?mood=X` | No | Inspiring quote matching mood level |
| `GET` | `/api/analytics/compare` | Bearer | Past 5 vs previous 5 window comparison |
| `GET` | `/api/analytics/rolling` | Bearer | 5-entry moving average |
| `GET` | `/api/analytics/streaks` | Bearer | Gaps & islands active/longest streak |
| `GET` | `/api/analytics/patterns` | Bearer | Day of week mood & sleep averages |
| `GET` | `/api/analytics/correlation` | Bearer | `CORR(mood, sleep_hours)` Pearson coefficient |
| `GET` | `/api/export?format=csv\|json` | Bearer | Download full check-in history |
| `POST` | `/api/jobs/reminders` | Header | Protected webhook for scheduled reminder dispatch |
| `POST` | `/api/jobs/retention` | Header | Protected webhook for 365-day weekly rollups |

---

## 🔒 Data Retention Policy
Entries older than **365 days** are automatically rolled up into weekly statistical aggregates (`weekly_summaries`) by the scheduled `/jobs/retention` background worker. This retains lifetime analytics without bloating high-frequency transactional tables.
