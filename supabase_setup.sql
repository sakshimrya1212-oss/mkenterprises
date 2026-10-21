-- =======================================================
-- MK ENTERPRISES: SUPABASE DATABASE INITIALIZATION SCRIPT
-- Run this script in your Supabase SQL Editor (1-Click)
-- =======================================================

-- 1. Create orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  address jsonb not null,
  items jsonb not null,
  subtotal numeric not null default 0,
  discount numeric not null default 0,
  shipping numeric not null default 0,
  cod_fee numeric not null default 0,
  total numeric not null default 0,
  coupon text,
  note text,
  payment_method text not null default 'cod',
  status text not null default 'COD_PENDING',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create index on order_number and phone for fast search
create index if not exists idx_orders_order_number on public.orders(order_number);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- 4. Policies for customer checkout and admin access
drop policy if exists "Public can create orders" on public.orders;
create policy "Public can create orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Public can view their own order by order_number" on public.orders;
create policy "Public can view their own order by order_number"
  on public.orders for select
  using (true);

drop policy if exists "Full access for all operations" on public.orders;
create policy "Full access for all operations"
  on public.orders for all
  using (true);
