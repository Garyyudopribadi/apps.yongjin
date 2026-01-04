-- MCU (Medical Checkup) Phase One schema
-- Notes:
-- - Uses snake_case identifiers (avoid dashes in table/column names)
-- - Models yearly MCU as one session per participant per year
-- - Stores every scan as an append-only event (paperless audit trail)

create extension if not exists pgcrypto;

-- Master participant data (pre-import recommended; API will create minimal row if missing)
create table if not exists public.mcu_participants (
  id uuid primary key default gen_random_uuid(),
  nik text not null,
  entity text,
  facility text,
  name text,
  department text,
  department_detail text,
  responsibility text,
  ktp text,
  birth_place text,
  birth_date date,
  gender text,
  enter_date date,
  bpjs_tk_no text,
  bpjs_kes text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mcu_participants_nik_uniq unique (nik)
);

create index if not exists mcu_participants_entity_idx
  on public.mcu_participants (entity);

create index if not exists mcu_participants_facility_idx
  on public.mcu_participants (facility);

create index if not exists mcu_participants_department_idx
  on public.mcu_participants (department);

-- Checkpoint master
create table if not exists public.mcu_checkpoints (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  sequence int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint mcu_checkpoints_code_uniq unique (code),
  constraint mcu_checkpoints_sequence_uniq unique (sequence)
);

-- Seed checkpoints (idempotent)
insert into public.mcu_checkpoints (code, name, sequence)
values
  ('register', 'Register', 1),
  ('tes_fisik', 'Tes Fisik', 2),
  ('tensi_mata', 'Tes Tensi Darah & Tes Mata', 3),
  ('tes_darah', 'Tes Darah', 4),
  ('tes_rontgen', 'Tes Rontgen', 5),
  ('urine', 'Tes Pengambilan & Pengumpulan Urine', 6)
on conflict (code) do update
set name = excluded.name,
    sequence = excluded.sequence;

-- One MCU per participant per year
create table if not exists public.mcu_sessions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.mcu_participants(id) on delete cascade,
  year int not null,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mcu_sessions_participant_year_uniq unique (participant_id, year)
);

create index if not exists mcu_sessions_participant_year_idx
  on public.mcu_sessions (participant_id, year);

create index if not exists mcu_sessions_year_status_updated_idx
  on public.mcu_sessions (year, status, updated_at desc);

-- Append-only scan log (every tap = a row)
create table if not exists public.mcu_scan_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mcu_sessions(id) on delete cascade,
  checkpoint_id uuid not null references public.mcu_checkpoints(id),
  scanned_at timestamptz not null default now(),
  source text not null default 'web',
  device_id text,
  created_at timestamptz not null default now()
);

create index if not exists mcu_scan_events_session_scanned_at_idx
  on public.mcu_scan_events (session_id, scanned_at desc);

-- Dashboard-friendly derived state per checkpoint
create table if not exists public.mcu_checkpoint_status (
  session_id uuid not null references public.mcu_sessions(id) on delete cascade,
  checkpoint_id uuid not null references public.mcu_checkpoints(id),
  status text not null default 'arrived',
  first_scanned_at timestamptz,
  last_scanned_at timestamptz,
  scan_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (session_id, checkpoint_id)
);

create index if not exists mcu_checkpoint_status_session_idx
  on public.mcu_checkpoint_status (session_id);

-- Trigger: on every scan event, upsert checkpoint status and mark finished on last checkpoint
create or replace function public.mcu_apply_scan_event()
returns trigger
language plpgsql
as $$
declare
  v_seq int;
  v_last_seq int;
begin
  select c.sequence into v_seq
  from public.mcu_checkpoints c
  where c.id = new.checkpoint_id;

  select max(c.sequence) into v_last_seq
  from public.mcu_checkpoints c
  where c.is_active = true;

  insert into public.mcu_checkpoint_status (
    session_id,
    checkpoint_id,
    status,
    first_scanned_at,
    last_scanned_at,
    scan_count,
    updated_at
  )
  values (
    new.session_id,
    new.checkpoint_id,
    'arrived',
    new.scanned_at,
    new.scanned_at,
    1,
    now()
  )
  on conflict (session_id, checkpoint_id)
  do update set
    last_scanned_at = excluded.last_scanned_at,
    scan_count = public.mcu_checkpoint_status.scan_count + 1,
    status = 'arrived',
    updated_at = now();

  if v_seq is not null and v_last_seq is not null and v_seq = v_last_seq then
    update public.mcu_sessions
    set status = 'finished',
        finished_at = coalesce(finished_at, new.scanned_at),
        updated_at = now()
    where id = new.session_id;
  else
    update public.mcu_sessions
    set updated_at = now()
    where id = new.session_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_mcu_apply_scan_event on public.mcu_scan_events;
create trigger trg_mcu_apply_scan_event
after insert on public.mcu_scan_events
for each row
execute function public.mcu_apply_scan_event();

-- Live dashboard view: one row per session with last scan info
create or replace view public.mcu_live_sessions as
select
  s.id as session_id,
  s.year,
  s.status,
  s.started_at,
  s.finished_at,
  s.updated_at,
  p.id as participant_id,
  p.nik,
  p.entity,
  p.facility,
  p.department,
  p.department_detail,
  p.ame,
  le.scanned_at as last_scanned_at,
  (extract(epoch from (now() - coalesce(le.scanned_at, s.started_at))) / 60)::int as last_scan_age_minutes,
  c.code as last_checkpoint_code,
  c.name as last_checkpoint_name,
  c.sequence as last_checkpoint_sequence,
  prog.checkpoints_done,
  prog.checkpoints_total
from public.mcu_sessions s
join public.mcu_participants p on p.id = s.participant_id
left join lateral (
  select e.checkpoint_id, e.scanned_at
  from public.mcu_scan_events e
  where e.session_id = s.id
  order by e.scanned_at desc
  limit 1
) le on true
left join public.mcu_checkpoints c on c.id = le.checkpoint_id
left join lateral (
  select
    coalesce(count(*) filter (where cs.status <> 'pending'), 0)::int as checkpoints_done,
    (select count(*) from public.mcu_checkpoints where is_active = true)::int as checkpoints_total
  from public.mcu_checkpoint_status cs
  where cs.session_id = s.id
) prog on true;
