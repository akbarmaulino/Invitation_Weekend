create table public.trip_history (
  id uuid not null default gen_random_uuid (),
  created_at timestamp without time zone not null default (now() AT TIME ZONE 'utc'::text),
  trip_day text null,
  trip_date date null,
  selection_json jsonb null,
  secret_message text null,
  user_id text null,
  trip_name text null,
  constraint trip_history_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_trip_history_user_id on public.trip_history using btree (user_id) TABLESPACE pg_default;