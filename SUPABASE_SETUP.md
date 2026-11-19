# Supabase setup

This app uses Supabase Auth for email/password sign-in, Postgres with Row Level Security (RLS) for classroom data, and a private Supabase Storage bucket for lesson materials and student submissions. Netlify hosts the Vite frontend.

## 1. Create the Supabase project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. In **SQL Editor**, run the complete `supabase/schema.sql` file from this repository. It creates the profile-on-signup trigger, homework/assignment/submission/progress tables, RLS policies, and the private `classroom-files` bucket. It is safe to run again for this initial schema.
3. In **Authentication → Providers**, enable Email. Configure email confirmation to match how you want students to join. Set your deployed Netlify URL (and local `http://localhost:5173`) in **Authentication → URL Configuration → Site URL / Redirect URLs**.
4. Copy the Project URL and the **publishable/anon key** from **Project Settings → API**. Never use a `service_role` or secret key in this frontend.

## 2. Add environment variables

For local development, copy `.env.example` to `.env.local` and set:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

In Netlify, open **Site configuration → Environment variables** and add the same two variables for the deploy contexts you use. Then trigger a new deploy; Vite embeds `VITE_` variables at build time.

## 3. Create the first teacher account

Public sign-up deliberately creates **student** profiles only; selecting “teacher” on a public form would let anyone grant themselves teacher access. First, sign up through the deployed site using the teacher's email and confirm the email if required. Then, in Supabase SQL Editor, promote that exact account (replace the email):

```sql
update public.profiles p
set role = 'teacher'
from auth.users u
where p.id = u.id and lower(u.email) = lower('teacher@example.com');
```

The trigger protects role changes from normal browser sessions. Repeat this trusted SQL step for additional teachers. Students self-register; the teacher can then assign homework to them. To restrict student sign-up to your class, switch Supabase Auth to invite-only and invite student emails from the Supabase dashboard.

## 4. Deploy to Netlify

1. Import `bekmurodmirpulatov-code/tutor-bekmurod` in Netlify (**Add new site → Import an existing project**) and choose the `main` branch.
2. Build command: `npm run build`; publish directory: `dist`. These are also in `netlify.toml`.
3. Add the environment variables above and deploy. Git-connected deploys rebuild on pushes. The SPA redirect is configured in `netlify.toml`.
4. Add the final `https://YOUR-SITE.netlify.app` address to Supabase Auth's allowed redirect URLs.

## 5. Use the classroom

- **Teacher:** sign in with the promoted account, create homework, optionally upload a material, choose students, and assign. Review student answers/files, add feedback and a 0–100 score, and save the grade.
- **Student:** create an account, sign in, download assigned materials, submit written answers and/or files, and track submitted work and achievements.
- Files are stored in a private bucket. Access is checked by Storage RLS; the app generates short-lived signed links for authorized downloads.

## Troubleshooting

- “Connect your classroom” means the two `VITE_` values were missing when the frontend was built. Add them and redeploy.
- A profile missing error means the signup trigger was not installed or the profile row was deleted. Re-run the schema and inspect the Supabase Auth user and `public.profiles` row.
- If email confirmation is on, students must confirm before they can sign in.
- Do not disable RLS or expose the Supabase service-role key to fix permissions. Inspect the policies in `supabase/schema.sql` instead.
