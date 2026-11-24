-- NEXERA Supabase schema. Run in Supabase > SQL Editor. Safe model: public (anon) may only INSERT enquiries/applications and READ published projects/team.
create table enquiries (id uuid primary key default gen_random_uuid(), created_at timestamptz default now(), name text not null check (char_length(name)<=120), email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'), company text, service text, message text not null check (char_length(message)<=4000));
create table applications (id uuid primary key default gen_random_uuid(), created_at timestamptz default now(), name text not null, email text not null, role text, portfolio_url text, message text check (char_length(message)<=4000), resume_path text);
create table projects (id uuid primary key default gen_random_uuid(), title text not null, summary text, status text default 'placeholder', published boolean default false);
create table team_members (id uuid primary key default gen_random_uuid(), name text not null, role text, skills text[], portfolio_url text, sort int default 0, published boolean default true);
alter table enquiries enable row level security; alter table applications enable row level security; alter table projects enable row level security; alter table team_members enable row level security;
create policy "anon insert enquiries" on enquiries for insert to anon with check (true);       -- no select policy = nobody public can read
create policy "anon insert applications" on applications for insert to anon with check (true);
create policy "public read projects" on projects for select to anon using (published);
create policy "public read team" on team_members for select to anon using (published);
-- Private resume bucket: anon may upload PDFs only, never list/read. Read files from the dashboard or with the service key on a server.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('resumes','resumes',false,5242880,array['application/pdf']);
create policy "anon upload resumes" on storage.objects for insert to anon with check (bucket_id='resumes');
-- Edit projects/team rows in the Supabase dashboard (authenticated owner), never from the public site.
