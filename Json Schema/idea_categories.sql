create table public.idea_categories (

  id uuid not null default gen_random_uuid (),

  category text not null,

  subtype text not null,

  icon text null,

  type_key text not null,

  photo_url text null,

  constraint idea_categories_pkey primary key (id),

  constraint idea_categories_type_key_key unique (type_key)

) TABLESPACE pg_default;
