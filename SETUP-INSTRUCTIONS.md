# Setup Instructions for Personal Collection App

## 🚀 Complete Setup Guide

Follow these steps to get your app fully functional with Supabase.

---

## Step 1: Run the Database Migration

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `complete-database-setup.sql`
5. Click **Run** to execute the SQL

This will create:
- ✅ `items` table (with collection_id and category_id support)
- ✅ `collections` table
- ✅ `categories` table
- ✅ Row Level Security (RLS) policies for all tables
- ✅ Automatic timestamp updates
- ✅ Proper indexes for performance

---

## Step 2: Set Up Storage Bucket (if not already done)

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it: `items`
4. Make it **Public** (toggle the public option)
5. Click **Create bucket**

---

## Step 3: Verify Your Setup

Run your Next.js app:

```bash
npm run dev
```

---

## 🎯 Features Now Available

### Home Page (/)
- ✅ View all your items
- ✅ Add new items with image upload
- ✅ Assign items to collections and categories
- ✅ Edit and update items
- ✅ Items automatically appear after adding

### My Collections Page (/collections)
- ✅ Create new collections with custom name, description, icon, and color
- ✅ View all collections with item counts
- ✅ Delete collections
- ✅ Collections automatically update when items are added

### Categories Page (/categories)
- ✅ Create new categories with custom name, description, icon, and color
- ✅ View all categories with item counts
- ✅ Delete categories
- ✅ Categories automatically update when items are added

### Settings Page (/settings)
- ✅ View and update profile information
- ✅ Manage preferences
- ✅ Sign out functionality

---

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only see and modify their own data
- **Authentication**: All pages require user authentication
- **Secure Storage**: Images are stored in Supabase Storage with proper permissions

---

## 📊 Database Schema

### items
- `id` - Primary key
- `user_id` - Foreign key to auth.users
- `title` - Item title
- `desc` - Item description
- `image_url` - URL to uploaded image
- `collection_id` - Optional link to collection
- `category_id` - Optional link to category
- `created_at`, `updated_at` - Timestamps

### collections
- `id` - Primary key
- `user_id` - Foreign key to auth.users
- `name` - Collection name
- `description` - Collection description
- `color` - Hex color code
- `icon` - Emoji icon
- `created_at`, `updated_at` - Timestamps

### categories
- `id` - Primary key
- `user_id` - Foreign key to auth.users
- `name` - Category name
- `description` - Category description
- `color` - Hex color code
- `icon` - Emoji icon
- `created_at`, `updated_at` - Timestamps

---

## 🎨 How to Use

1. **Sign up/Login** to your account
2. **Create Collections** - Go to "My Collections" and click "+ New Collection"
3. **Create Categories** - Go to "Categories" and click "+ New Category"
4. **Add Items** - On the home page, click "+ Add New Item"
   - Fill in title and description
   - Select a collection (optional)
   - Select a category (optional)
   - Upload an image (optional)
5. **View Everything** - All your items, collections, and categories are synced in real-time!

---

## 🐛 Troubleshooting

### Items not showing up?
- Check that you're logged in
- Verify RLS policies are enabled in Supabase
- Check browser console for errors

### Images not uploading?
- Verify the `items` storage bucket exists and is public
- Check Storage policies in Supabase

### Collections/Categories not appearing?
- Make sure you ran the complete SQL migration
- Check that the tables exist in Supabase Table Editor

---

## 📝 Notes

- All data is automatically filtered by user (you only see your own data)
- Item counts in collections/categories update automatically
- Deleting a collection/category won't delete the items (they'll just be unlinked)
- All timestamps are managed automatically

---

## ✨ Next Steps

You can enhance the app further by:
- Adding search and filter functionality
- Creating collection/category detail pages
- Adding bulk operations
- Implementing sharing features
- Adding export/import functionality

Enjoy your Personal Collection App! 🎉
