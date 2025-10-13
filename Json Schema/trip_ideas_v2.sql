create table public.trip_ideas_v2 (

  id uuid not null default gen_random_uuid (),

  created_at timestamp with time zone null default now(),

  idea_name text not null,

  type_key text null,

  day_of_week text null,

  photo_url text null,

  constraint trip_ideas_v2_pkey primary key (id),

  constraint trip_ideas_v2_type_key_fkey foreign KEY (type_key) references idea_categories (type_key)

) TABLESPACE pg_default;