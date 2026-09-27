# Jyotisha — Deploy on Vercel (free)

## 1. GitHub
New repo `jyotisha-vercel` → **Add file → Upload files** → drag everything from this zip → **Commit**.

## 2. Vercel
vercel.com → **Add New → Project** → Import `jyotisha-vercel` → leave settings → **Deploy**.

## 3. Database (saves phone numbers)
Project → **Storage** tab → **Create Database** → **Upstash for Redis** (Free) → **Connect**.
(Adds KV_REST_API_URL + KV_REST_API_TOKEN automatically.)

## 4. Dashboard password
Project → **Settings → Environment Variables** → Add:
- Key `ADMIN_KEY` · Value `Jyotisha2026` (your password) → **Save**

## 5. Restart
**Deployments** tab → top row **⋯** → **Redeploy**.

## 6. Test
- Site → Premium → your number → Continue
- `https://YOUR-SITE.vercel.app/admin` → password → your number shows ✅

Optional: `ANTHROPIC_API_KEY` for AI readings (site works offline without it).
Note: Vercel free (Hobby) plan is for personal / non-commercial use.
