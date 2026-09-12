-- Phase 8: AI customer-service agent.
create table if not exists ai_knowledge_base (
  id uuid primary key,
  question text not null,
  keywords text[] not null,
  answer text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type ticket_status as enum ('open', 'resolved');

-- user_id is null for an unauthenticated visitor's chat; email is whatever
-- we have on hand (the member's account email, or nothing for a visitor).
-- No foreign key to users(id): a session JWT can outlive the account it
-- names (deleted/suspended user, up to 7 days), and a ticket must still be
-- creatable in that case rather than throwing on insert.
create table if not exists support_tickets (
  id uuid primary key,
  user_id uuid,
  email text,
  message text not null,
  status ticket_status not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists support_tickets_status_idx on support_tickets(status);

-- Seeded from the verified facts in data/gym-info.ts. The chat agent only
-- ever answers from rows here, so this is what it actually knows.
insert into ai_knowledge_base (id, question, keywords, answer)
values
  (
    '9c1f1a10-0001-4a1a-9f10-000000000001',
    'What services do you offer?',
    array['service', 'services', 'offer', 'classes', 'activities'],
    'We offer Personal Training, Cycling, Aerobics, Nutrition Consulting, Swimming, Private Lessons, and Youth Fitness Activities.'
  ),
  (
    '9c1f1a10-0001-4a1a-9f10-000000000002',
    'What facilities do you have?',
    array['facility', 'facilities', 'pool', 'sauna', 'tennis', 'court'],
    'Our facilities include a Swimming Pool, a Sauna, and a Tennis Court.'
  ),
  (
    '9c1f1a10-0001-4a1a-9f10-000000000003',
    'Where are you located?',
    array['location', 'address', 'where', 'dhahran', 'directions'],
    'We are located at Abdullah Ibn Al Abbas St, Al Dawhah Al Janubiyah, Dhahran, Saudi Arabia.'
  ),
  (
    '9c1f1a10-0001-4a1a-9f10-000000000004',
    'What is your phone number?',
    array['phone', 'number', 'call', 'contact'],
    'You can reach us at 013 891 2413.'
  ),
  (
    '9c1f1a10-0001-4a1a-9f10-000000000005',
    'How much does membership cost?',
    array['price', 'pricing', 'cost', 'fee', 'membership plan', 'how much'],
    'Membership pricing is confirmed by our front desk — please call 013 891 2413 or visit us for current plans and rates.'
  ),
  (
    '9c1f1a10-0001-4a1a-9f10-000000000006',
    'What is your rating?',
    array['rating', 'reviews', 'stars', 'review'],
    'We currently hold a 4.1-star rating from 45 reviews.'
  )
on conflict (id) do nothing;
