-- =========================================================================
-- EMPPULSE - SUPABASE DATABASE SCHEMA CONFIGURATION
-- =========================================================================
-- This script contains table definitions, indices, profile synchronization
-- triggers, and Row-Level Security (RLS) policies for Supabase PostgreSQL.
-- Paste this script directly in the Supabase SQL Editor.

-- Enable UUID Extension
create extension if not exists "uuid-ossp";

-- Clean up existing objects to allow clean re-runs of this script
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user cascade;

drop table if exists public.activity_log cascade;
drop table if exists public.notifications cascade;
drop table if exists public.attendance cascade;
drop table if exists public.attachments cascade;
drop table if exists public.comments cascade;
drop table if exists public.tasks cascade;
drop table if exists public.profiles cascade;

-- =========================================================================
-- 1. PUBLIC PROFILES TABLE
-- =========================================================================
-- Extends Supabase auth.users with custom attributes (role, department, status, avatar)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null unique,
    role text not null check (role in ('manager', 'employee')) default 'employee',
    department text,
    designation text,
    status text not null check (status in ('active', 'inactive')) default 'active',
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 2. TASKS TABLE
-- =========================================================================
create table public.tasks (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    assigned_to uuid references public.profiles(id) on delete set null,
    assigned_by uuid references public.profiles(id) on delete set null,
    priority text not null check (priority in ('low', 'medium', 'high', 'critical')) default 'medium',
    deadline date not null,
    status text not null check (status in ('Not Started', 'In Progress', 'Under Review', 'Completed')) default 'Not Started',
    progress integer not null check (progress >= 0 and progress <= 100) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 3. DISCUSSION COMMENTS TABLE
-- =========================================================================
create table public.comments (
    id uuid default gen_random_uuid() primary key,
    task_id uuid references public.tasks(id) on delete cascade not null,
    author_id uuid references public.profiles(id) on delete cascade not null,
    text text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 4. ATTACHMENTS TABLE
-- =========================================================================
create table public.attachments (
    id uuid default gen_random_uuid() primary key,
    task_id uuid references public.tasks(id) on delete cascade not null,
    name text not null,
    size text not null,
    url text not null, -- URL/path to the file in Supabase Storage buckets
    uploaded_by uuid references public.profiles(id) on delete set null,
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 5. ATTENDANCE CLOCK TABLE
-- =========================================================================
create table public.attendance (
    id uuid default gen_random_uuid() primary key,
    employee_id uuid references public.profiles(id) on delete cascade not null,
    date date not null default current_date,
    clock_in time without time zone not null,
    clock_out time without time zone,
    hours_worked numeric(4, 2), -- decimal hours clocked, calculated on clock_out
    status text not null check (status in ('On Time', 'Late', 'Absent')) default 'On Time',
    constraint unique_employee_date unique (employee_id, date)
);

-- =========================================================================
-- 6. NOTIFICATIONS TABLE
-- =========================================================================
create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    employee_id uuid references public.profiles(id) on delete cascade not null,
    text text not null,
    read boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 7. AUDIT ACTIVITY LOG TABLE
-- =========================================================================
create table public.activity_log (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    user_name text not null,
    user_role text not null,
    action text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- PERFORMANCE OPTIMIZATION INDICES
-- =========================================================================
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_comments_task_id on public.comments(task_id);
create index idx_attachments_task_id on public.attachments(task_id);
create index idx_attendance_employee_id on public.attendance(employee_id);
create index idx_notifications_employee_id_read on public.notifications(employee_id, read);
create index idx_activity_log_timestamp on public.activity_log(timestamp desc);


-- =========================================================================
-- AUTOMATED USER CREATION SYNC TRIGGER
-- =========================================================================
-- This trigger automatically synchronizes newly signed up users from
-- auth.users (Supabase native Auth) to our public.profiles table.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, department, designation, status, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New Employee'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    coalesce(new.raw_user_meta_data->>'department', 'Engineering'),
    coalesce(new.raw_user_meta_data->>'designation', 'Junior Associate'),
    'active',
    upper(substring(coalesce(new.raw_user_meta_data->>'name', 'New Employee') from 1 for 2))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.attendance enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

-- --- 1. Profiles Policies ---
create policy "Allow view all profiles" on public.profiles for select to authenticated using (true);
create policy "Allow self profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Allow managers full control on profiles" on public.profiles for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
);

-- --- 2. Tasks Policies ---
create policy "Allow managers full control on tasks" on public.tasks for all to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
);
create policy "Allow employees to view own tasks" on public.tasks for select to authenticated using (assigned_to = auth.uid());
create policy "Allow employees update progress" on public.tasks for update to authenticated using (assigned_to = auth.uid()) with check (assigned_to = auth.uid());

-- --- 3. Comments & Attachments Policies ---
create policy "Allow view comments for assigned task" on public.comments for select to authenticated using (
  exists (select 1 from public.tasks where id = task_id and (assigned_to = auth.uid() or assigned_by = auth.uid()))
);
create policy "Allow insert comments" on public.comments for insert to authenticated with check (auth.uid() = author_id);

create policy "Allow view attachments for task" on public.attachments for select to authenticated using (
  exists (select 1 from public.tasks where id = task_id and (assigned_to = auth.uid() or assigned_by = auth.uid()))
);
create policy "Allow upload attachments" on public.attachments for insert to authenticated with check (auth.uid() = uploaded_by);

-- --- 4. Attendance Policies ---
create policy "Allow managers view all attendance" on public.attendance for select to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
);
create policy "Allow employees manage own attendance" on public.attendance for all to authenticated using (employee_id = auth.uid());

-- --- 5. Notifications & Activity Log Policies ---
create policy "Allow view own notifications" on public.notifications for select to authenticated using (employee_id = auth.uid());
create policy "Allow update own notifications" on public.notifications for update to authenticated using (employee_id = auth.uid());
create policy "Allow read audit logs to managers" on public.activity_log for select to authenticated using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'manager')
);
