-- Phase 9: trainers, classes & bookings.
create table if not exists trainers (
  id uuid primary key,
  name text not null,
  specialty text not null,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key,
  trainer_id uuid not null references trainers(id),
  name text not null,
  description text,
  starts_at timestamptz not null,
  duration_minutes int not null default 60,
  capacity int not null default 10,
  created_at timestamptz not null default now()
);

create index if not exists classes_starts_at_idx on classes(starts_at);

-- Deleting a class (e.g. admin cancels it outright) frees every booking for
-- it; a trainer with existing classes can't be deleted out from under them.
create table if not exists bookings (
  id uuid primary key,
  class_id uuid not null references classes(id) on delete cascade,
  user_id uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (class_id, user_id)
);

create index if not exists bookings_class_id_idx on bookings(class_id);

alter type email_type add value if not exists 'booking_confirmation';
