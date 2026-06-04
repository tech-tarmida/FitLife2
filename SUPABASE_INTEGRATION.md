# FitLife - Supabase Integration Guide

## Overview

FitLife is fully integrated with Supabase for authentication, database management, and file storage. This guide explains the setup and features.

## Authentication

### Built-in Features
- Email/password signup and login
- Password reset via email
- Automatic profile creation on signup via Postgres trigger
- Session management with JWT tokens
- Row Level Security (RLS) on all tables

### How It Works
1. User signs up with email and password
2. Supabase Auth creates a user record in `auth.users`
3. Postgres trigger (`on_auth_user_created`) automatically creates a profile in `profiles` table
4. All subsequent data is tied to `auth.uid()` for security

## Database Schema

### Core Tables

**profiles**
- Stores user fitness information
- Auto-created on signup
- Fields: weight, height, fitness goal, subscription tier, etc.
- RLS: Users can only view/edit their own profile

**workouts**
- Admin-created workout plans
- Categories: weight_loss, muscle_gain, home, cardio, yoga, strength
- Difficulty levels: beginner, intermediate, advanced
- Supports premium content flags

**exercises**
- Exercise library with instructions and images
- Muscle groups, equipment, difficulty levels
- Searchable by name and category

**user_workout_logs**
- Tracks completed workouts per user
- Records duration, calories burned, date
- Enables progress tracking

**progress_logs**
- Body measurements (weight, body fat, chest, waist, etc.)
- Logged per date for trend analysis
- RLS: Users only see own data

**notes** (NEW)
- User-created workout notes
- Supports file attachments
- Searchable by title and content
- Timestamped for tracking

**note_attachments** (NEW)
- File metadata for notes
- Stores file size, type, and storage path
- Cascade deletion with parent note

### Other Tables
- `nutrition_tips` - Admin-curated nutrition content
- `water_intake` - Daily water tracking
- `streaks` - Workout streak tracking
- `daily_challenges` - Admin-defined daily challenges
- `user_challenge_completions` - Track challenge completion
- `badges` - Achievement definitions
- `user_badges` - Earned badges per user
- `subscriptions` - User subscription plans
- `saved_workouts` - Bookmarked workouts

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

```sql
-- Users can only see their own data
SELECT: auth.uid() = user_id
INSERT: auth.uid() = user_id
UPDATE: auth.uid() = user_id
DELETE: auth.uid() = user_id

-- Admins can manage workouts/exercises
is_admin = true in profiles table

-- Public data (workouts, exercises, tips) viewable by all authenticated users
```

## File Storage

### Storage Bucket: `note-attachments`

Used for storing workout note attachments.

**Upload Specifications:**
- Max file size: 50MB
- Allowed types: Images, PDFs, audio, video, documents
- Path format: `{user_id}/{timestamp}_{filename}`
- Auto-organized per user

**Usage:**

```typescript
import { uploadFile, downloadFile, deleteFile } from './lib/fileStorage';

// Upload
const result = await uploadFile(file, userId);
if (result?.error) console.error(result.error);

// Download
const blob = await downloadFile(storagePath);

// Delete
await deleteFile(storagePath);
```

## API Integration

### Supabase Client Setup

The app uses `@supabase/supabase-js` with environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Auth Context

All authentication managed via `AuthContext`:

```typescript
import { useAuth } from './contexts/AuthContext';

const { user, profile, signIn, signUp, signOut, updateProfile } = useAuth();
```

### Database Queries

Example patterns:

```typescript
// Read
const { data } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', user.id);

// Create
await supabase.from('notes').insert({
  user_id: user.id,
  title: 'My Note',
  content: 'Content here'
});

// Update
await supabase.from('notes')
  .update({ title: 'Updated' })
  .eq('id', noteId);

// Delete
await supabase.from('notes').delete().eq('id', noteId);
```

## Features Enabled by Supabase

### 1. User Authentication
- Email/password auth with secure password reset
- Session persistence across browser refreshes
- Auto-logout on token expiration

### 2. Personalized Data
- Each user sees only their own workouts, notes, and progress
- Streaks and badges tracked per user
- Profile customization (goals, body metrics, preferences)

### 3. Workout Tracking
- Log completed workouts with duration and calories
- Automatic streak calculation
- Progress analytics with charts
- Save favorite workouts

### 4. Note-Taking with Files
- Create rich notes for each workout
- Attach up to 50MB files per attachment
- Download or delete attachments
- Search notes by title/content

### 5. Admin Features
- Create and manage workout plans
- Publish/unpublish content
- View user statistics
- Create daily challenges and nutrition tips

### 6. Premium Subscriptions
- Three-tier system: Free, Premium, Pro
- Flag premium-only content
- Database records subscription status

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from Supabase dashboard: Settings → API

### 2. Enable Storage Bucket

In Supabase dashboard:
1. Go to Storage
2. Create a new bucket called `note-attachments`
3. Set permissions to allow authenticated users

### 3. Set Up Email Service

In Supabase dashboard:
1. Go to Authentication → Email Templates
2. Customize password reset email template
3. Configure SMTP for email sending (optional)

### 4. Configure RLS

All RLS policies are created automatically via migrations. No manual setup needed.

## Development Workflow

### Local Development

```bash
npm install
npm run dev
```

The app connects to your Supabase project in real-time.

### Testing Auth

1. Sign up with test email
2. Check Supabase dashboard → Authentication → Users
3. Profile auto-created in database

### Testing File Uploads

1. Create a note with attachments
2. Check Storage → note-attachments bucket
3. Files organized by user ID

## Production Considerations

### Security

- All queries use parameterized statements (Supabase SDK default)
- Row Level Security enforced at database level
- No sensitive data in client-side code
- JWT tokens auto-refreshed

### Performance

- Indexes on frequently queried columns (user_id, created_at)
- Pagination on large lists
- File uploads optimized with cloud CDN

### Monitoring

- Monitor auth success rates in Supabase dashboard
- Track storage usage for file uploads
- Review RLS policy violations in logs

## Troubleshooting

### Auth Issues
- **Can't sign up**: Check email format and password length (min 8 chars)
- **Session lost**: Browser cookies may be blocked, check privacy settings
- **Password reset not received**: Check spam folder, verify SMTP config

### Database Issues
- **Permission denied**: Check RLS policies match user_id
- **Slow queries**: Check indexes are created
- **Out of disk**: Monitor storage usage, delete old attachments

### File Upload Issues
- **Upload fails**: Check file size (<50MB) and type allowed
- **Can't download**: Verify storage bucket permissions
- **File missing**: Check storage_path in database matches actual file

## Best Practices

1. **Always check auth status** before rendering protected content
2. **Use RLS** - don't implement authorization in app code
3. **Handle errors** from all Supabase calls
4. **Validate file uploads** on client and server
5. **Monitor storage** quota to avoid surprises
6. **Use prepared statements** (automatic with Supabase SDK)
7. **Log important events** for debugging
8. **Test RLS policies** thoroughly before production

## Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase JavaScript Docs](https://supabase.com/docs/reference/javascript)
- [Auth Documentation](https://supabase.com/docs/guides/auth)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
