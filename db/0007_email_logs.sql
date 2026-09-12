-- Phase 6: mocked email system.
create type email_type as enum (
  'welcome',
  'payment_confirmation',
  'renewal_reminder',
  'membership_expired',
  'contact_response'
);
create type email_status as enum ('sent', 'failed');

create table if not exists email_logs (
  id uuid primary key,
  recipient text not null,
  subject text not null,
  type email_type not null,
  status email_status not null default 'sent',
  created_at timestamptz not null default now()
);

create index if not exists email_logs_created_at_idx on email_logs(created_at desc);
