# Getting Your Supabase API Keys

This guide shows exactly where to find your Supabase credentials.

## Step 1: Log In to Supabase

Go to https://app.supabase.com and sign in to your account.

## Step 2: Open Project Settings

1. Click on your **project name** in the left sidebar
2. Click the **gear icon** (⚙️) at the bottom left → **Project Settings**

Alternative:
- At the top right, click the **Settings** tab

## Step 3: Find API Keys

In Project Settings, click the **API** tab on the left.

You'll see:

```
PROJECT URL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
https://xxxxxxxxxxxxx.supabase.co

KEYS & TOKENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
anon (public)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

service_role (secret)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Copy Your Credentials

### For Frontend (.env file)
**Copy these TWO values:**

1. **Project URL** → `VITE_SUPABASE_URL`
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   ```

2. **anon (public) key** → `VITE_SUPABASE_ANON_KEY`
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## ⚠️ IMPORTANT: Use anon, NOT service_role

- ✅ **anon (public)** - Use this for frontend apps (it's safe, limited by RLS)
- ❌ **service_role** - NEVER use this in frontend (it bypasses all RLS)

The service_role key should only be used on your backend server.

## Step 5: Add to .env File

Create or edit `.env` in your project root:

```bash
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1pZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzc3OTkwMjQzLCJleHAiOjIwOTM2NzI0M30.xxxxxxxxxxxx
```

## Step 6: Verify Setup

1. Save `.env` file
2. Restart dev server: `npm run dev`
3. App should connect to Supabase automatically
4. Try signing up to test

## Troubleshooting

### "Cannot find .env file"
Make sure `.env` is in the root directory (same level as `package.json`)

### "Invalid URL or key"
1. Double-check you copied the full values (no extra spaces)
2. Make sure you used **anon key**, not service_role key
3. Verify the URL ends with `.supabase.co`

### "Still not connecting"
1. Restart dev server after changing `.env`
2. Check browser console for error messages
3. Verify keys in Supabase dashboard haven't expired

---

**That's all!** Once your `.env` is set up, the app is ready to use Supabase.
