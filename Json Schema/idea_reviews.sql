create table public.idea_reviews (
  id uuid not null default gen_random_uuid (),
  created_at timestamp without time zone not null default (now() AT TIME ZONE 'utc'::text),
  idea_id uuid null,
  user_id text null,
  review_text text null,
  photo_url text[] null,
  rating integer null default 0,
  trip_id uuid null,
  constraint idea_reviews_pkey primary key (id),
  constraint idea_reviews_idea_id_trip_id_key unique (idea_id, trip_id),
  constraint unique_idea_user_trip unique (idea_id, user_id, trip_id),
  constraint unique_review_per_trip unique (idea_id, user_id, trip_id),
  constraint idea_reviews_idea_id_fkey foreign KEY (idea_id) references trip_ideas_v2 (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists unique_idea_user_trip_review on public.idea_reviews using btree (idea_id, user_id, trip_id) TABLESPACE pg_default;