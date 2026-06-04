# FitLife Supabase Integration - Quick Start

## 🚀 Get Started in 3 Minutes

### 1️⃣ Get API Keys (1 min)
- Go to https://app.supabase.com
- Click your project → Settings → API
- Copy **Project URL** and **anon key**

### 2️⃣ Configure App (1 min)
Create `.env` file in project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3️⃣ Run App (1 min)
```bash
npm run dev
```

## ✅ Test It Works

1. **Auth Test**
   - Click "Get Started" on landing
   - Sign up with email
   - Should see Dashboard

2. **Database Test**
   - Go to Notes page
   - Create a note
   - Note appears in Supabase Dashboard → SQL Editor

3. **Files Test**
   - Upload file to note
   - File appears in Supabase Dashboard → Storage

## 📝 What's New

| Feature | How to Use |
|---------|-----------|
| **Sign Up** | Landing page → "Get Started" |
| **Log In** | Click "Sign In" if already member |
| **Notes** | Dashboard → "Notes" button |
| **Upload Files** | Notes page → "Choose Files" |
| **Download** | Notes page → Download icon |
| **Edit Note** | Notes page → Edit button |
| **Delete** | Notes page → Delete button |

## 🔑 API Keys Location

**Project URL:**
```
Supabase Dashboard → Settings → API → Project URL
```

**Anon Key:**
```
Supabase Dashboard → Settings → API → anon (public)
```

⚠️ **Never use `service_role` key in frontend!**

## 📂 Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `note-attachments`
4. Make it **Public**
5. Done!

## 🐛 Troubleshooting

**Problem:** "Missing env variables"
```
✓ Check .env file exists in project root
✓ Check no typos in variable names
✓ Restart dev server after changing .env
```

**Problem:** "Cannot upload files"
```
✓ Verify bucket "note-attachments" exists
✓ Check bucket is PUBLIC
✓ File must be < 50MB
```

**Problem:** "Can't see my notes"
```
✓ Make sure you're logged in
✓ Notes are private (only YOU see yours)
✓ Check Supabase dashboard that note exists
```

## 📚 Full Documentation

- **GET_API_KEYS.md** - Detailed key retrieval
- **SUPABASE_SETUP.md** - Full setup checklist
- **SUPABASE_INTEGRATION.md** - Technical details
- **README_SUPABASE.md** - Overview

## 💡 Key Features

✅ Email/password authentication
✅ Secure user data (RLS enforced)
✅ Create and edit notes
✅ Upload files to notes
✅ Search notes
✅ Download files
✅ Delete notes and files

## 🎯 Next Steps

1. [ ] Get API keys from Supabase
2. [ ] Add to `.env` file
3. [ ] Run `npm run dev`
4. [ ] Test sign up
5. [ ] Test notes with files
6. [ ] Deploy to production!

## 🆘 Need Help?

- Check `SUPABASE_SUMMARY.txt` for full details
- Visit https://supabase.com/docs
- Check browser console for error messages

---

**That's it!** Your app is connected and ready. 🎉
