-- Phase 5: admin dashboard — suspend/activate members.
alter table users add column if not exists is_active boolean not null default true;
