-- Phase 7: attendance (QR + manual check-in).
create type attendance_method as enum ('qr', 'manual');

create table if not exists attendance (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  method attendance_method not null,
  checked_in_at timestamptz not null default now()
);

create index if not exists attendance_user_id_idx on attendance(user_id);
create index if not exists attendance_checked_in_at_idx on attendance(checked_in_at desc);
