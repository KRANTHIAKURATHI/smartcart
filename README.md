# SmartCart — Smart Commerce Platform

A production-ready smart commerce platform with real-time cart sync, role-based access, and instant checkout.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Auth**: Supabase Auth with RLS (Row Level Security)

## Features

- 🔴 **Real-time cart sync** — cart updates instantly across sessions via Supabase Realtime
- ⚡ **Instant checkout** — simulated payment with order confirmation
- 🔐 **Role-based access** — USER, STAFF, ADMIN with RLS policies
- 📦 **Inventory management** — live stock updates, low-stock alerts
- 💸 **Discount engine** — per-product percentage discounts
- 📊 **Admin analytics** — revenue, order tracking, product CRUD
- 👨‍🔧 **Staff panel** — view and edit customer carts directly

---

## Setup Guide

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Give it a name (e.g., `smartcart`), set a database password, choose a region
4. Wait ~2 minutes for it to provision

### Step 2: Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of `supabase_schema.sql`
4. Click **Run** (or press Ctrl+Enter)

This will:
- Create all 8 tables with foreign keys
- Add performance indexes
- Enable Row Level Security
- Set up all RLS policies
- Enable Realtime subscriptions
- Insert 12 sample products with discounts

### Step 3: Enable Realtime

1. In Supabase dashboard → **Database** → **Replication**
2. Make sure `supabase_realtime` publication includes:
   - `cart_items`
   - `carts`
   - `orders`
   - `products`

(The SQL schema does this automatically, but verify it's active)

### Step 4: Configure Environment Variables

1. In Supabase dashboard → **Project Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. In your project root:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### Step 5: Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## User Roles

| Role  | Access |
|-------|--------|
| USER  | Browse products, add to cart, checkout, view own orders |
| STAFF | Everything USER has + view/edit any customer's cart |
| ADMIN | Everything STAFF has + product CRUD, discounts, inventory, all orders |

To create an admin/staff account:
1. Click **Sign Up** on the auth page
2. Select **Staff** or **Admin** from the Account Type dropdown

---

## Project Structure

```
smartcart/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx     # Main layout wrapper
│   │   │   ├── Sidebar.jsx       # Navigation sidebar with categories
│   │   │   └── TopBar.jsx        # Header with search
│   │   └── ui/
│   │       ├── ProductCard.jsx   # Product grid card
│   │       ├── Toast.jsx         # Notification system
│   │       ├── Modal.jsx         # Reusable modal
│   │       ├── Skeletons.jsx     # Loading skeletons
│   │       └── LoadingScreen.jsx # Full-screen loader
│   ├── pages/
│   │   ├── AuthPage.jsx          # Login / Sign up
│   │   ├── HomePage.jsx          # Product grid + filters
│   │   ├── ProductDetailsPage.jsx# Single product page
│   │   ├── CartPage.jsx          # Cart + checkout
│   │   ├── OrdersPage.jsx        # Order history with live status
│   │   ├── AdminDashboard.jsx    # Admin: products, orders, analytics
│   │   └── StaffPanel.jsx        # Staff: manage customer carts
│   ├── store/
│   │   ├── authStore.js          # Auth + user profile (Zustand)
│   │   ├── cartStore.js          # Cart + realtime sync (Zustand)
│   │   ├── productStore.js       # Products + categories (Zustand)
│   │   └── orderStore.js         # Orders + realtime (Zustand)
│   ├── lib/
│   │   └── supabase.js           # Supabase client
│   ├── App.jsx                   # Router + protected routes
│   └── main.jsx                  # Entry point
├── supabase_schema.sql           # Full DB schema + RLS + seed data
├── .env.example                  # Environment template
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Database Schema

```
users          → id, email, role, created_at
products       → id, name, description, price, category, stock, image_url
carts          → id, user_id (1:1 with users)
cart_items     → id, cart_id, product_id, quantity
orders         → id, user_id, total_amount, status, payment_status
order_items    → id, order_id, product_id, quantity, price
discounts      → id, product_id, percentage (unique per product)
inventory_logs → id, product_id, change, note, timestamp
```

---

## Build for Production

```bash
npm run build
npm run preview    # Preview production build locally
```

---

## Deployment

### Vercel (recommended)
```bash
npm i -g vercel
vercel
# Add env vars in Vercel dashboard or via CLI:
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
# Add env vars in Netlify dashboard
```

---

## Troubleshooting

**"Missing Supabase environment variables"**
→ Make sure `.env` exists and contains valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**"new row violates row-level security policy"**
→ Make sure you ran the full `supabase_schema.sql`. Check Supabase → Authentication → Policies

**Cart not syncing in real-time**
→ Verify Realtime is enabled for `cart_items` in Supabase → Database → Replication

**Products not loading**
→ Check if seed data was inserted. Go to Supabase → Table Editor → products
