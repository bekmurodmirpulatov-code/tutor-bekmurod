# ACE English Classroom

A Netlify-ready homework and progress tracker for English teachers and students. The frontend is React + Vite; Supabase provides email/password authentication, the Postgres database, Row Level Security, and private file storage.

## Start locally

```sh
npm install
cp .env.example .env.local
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local
npm run dev
```

Build for deployment with `npm run build` (output: `dist`). For database, teacher provisioning, storage, and Netlify instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and run [supabase/schema.sql](supabase/schema.sql) in your Supabase SQL Editor.
