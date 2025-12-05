create table if not exists public.password_reset_codes (
  id bigserial primary key,
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_password_reset_email on public.password_reset_codes(email);
create index if not exists idx_password_reset_expires on public.password_reset_codes(expires_at);
