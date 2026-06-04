# Supabase Setup Checklist

## Before You Start
- [ ] Have a Supabase account (supabase.com)
- [ ] Have a project created in Supabase
- [ ] Have your Supabase URL and anon key ready

## Step 1: Add Environment Variables
```bash
# In your .env file, add:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase Dashboard:
1. Go to **Project Settings** (gear icon)
2. Click **API** tab
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **anon (public)** key → `VITE_SUPABASE_ANON_KEY`

## Step 2: Verify Database Tables
All tables are auto-created by migrations:

```bash
npm run build  # This runs migrations
```

Check in Supabase Dashboard → SQL Editor:
- [ ] profiles table exists
- [ ] notes table exists
- [ ] note_attachments table exists
- [ ] Other tables (workouts, exercises, etc.) exist

## Step 3: Set Up File Storage Bucket
1. Go to Supabase Dashboard → **Storage**
2. Click **Create a new bucket**
3. Name it: `note-attachments`
4. Make it **Public** (for downloads)
5. Click **Create bucket**

Verify:
- [ ] Bucket `note-attachments` is created
- [ ] Bucket is public (can be accessed)

## Step 4: Enable Authentication
1. Go to Supabase Dashboard → **Authentication**
2. Click **Providers** tab
3. Verify **Email** provider is enabled (default)
4. Go to **Email Templates** tab
5. Check password reset email template exists

Verify:
- [ ] Email/Password auth enabled
- [ ] Email templates configured

## Step 5: Test the App

### Test Authentication
1. Start the app: `npm run dev`
2. Navigate to landing page
3. Click "Get Started"
4. Sign up with test email and password
5. You should be logged in to dashboard

### Test Database
1. Go to Dashboard → Notes
2. Create a new note with title and content
3. Check Supabase Dashboard → SQL Editor:
   ```sql
   SELECT * FROM notes;
   ```
4. Your note should appear

### Test File Upload
1. In the note, upload a file
2. Check Supabase Dashboard → Storage → note-attachments
3. File should appear (organized by your user ID)

## Step 6: Verify RLS (Row Level Security)

Test that users can't see each other's data:
1. Create a note while logged in as user A
2. In database, check: `SELECT * FROM notes;` (should show 1 row)
3. Switch to different browser/incognito and sign up as user B
4. Create a note
5. In Supabase, user B's note should be invisible to user A's app session

This confirms RLS is working.

## Step 7: Production Configuration

Before going live:

### Security
- [ ] All API keys are in `.env`, not committed to git
- [ ] Anon key is truly public-only (not service role key!)
- [ ] Check RLS policies are restrictive

### Storage Bucket
- [ ] File upload size limits enforced (50MB max)
- [ ] Old/unused files cleaned up periodically
- [ ] Backup plan for user data

### Database
- [ ] Backup enabled in Supabase settings
- [ ] Monitor storage usage
- [ ] Check query logs for slow queries

### Auth
- [ ] Email domain configured (if custom domain)
- [ ] Password reset email working
- [ ] Consider enabling 2FA for admin accounts

## Common Issues & Solutions

### "Authentication failed" error
**Problem**: Invalid Supabase URL or anon key
**Solution**: 
1. Copy credentials again from Supabase dashboard
2. Verify no extra spaces in .env
3. Restart dev server

### File upload fails
**Problem**: Storage bucket not created or wrong name
**Solution**:
1. Create bucket named exactly: `note-attachments`
2. Make it public
3. Try uploading again

### Can't see user data
**Problem**: RLS policies blocking access
**Solution**:
1. Verify you're logged in as correct user
2. Check RLS policies use `auth.uid()`
3. Test in incognito window to confirm

### Slow queries
**Problem**: Missing indexes
**Solution**:
1. Indexes auto-created via migration
2. Check: `SELECT * FROM pg_stat_indexes;` in SQL editor
3. Query performance should improve after indexes

## Support

For help:
1. Check migration logs: `SELECT * FROM supabase_migrations;`
2. Review RLS policies: Supabase Dashboard → Authentication → RLS
3. Check storage bucket permissions: Dashboard → Storage → Settings
4. Monitor auth logs: Dashboard → Authentication → Logs

---

**That's it!** Your FitLife app is now fully connected to Supabase. 

All user data is secure with RLS, authentication is handled, and file uploads work. Ready to go live!
