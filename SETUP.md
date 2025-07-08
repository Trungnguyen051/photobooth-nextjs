# Photo Booth Setup Instructions

This application captures 4 photos and saves them to Supabase. Follow these steps to set up the backend:

## 1. Supabase Project Setup

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Get your project URL and anon key from the project settings

## 2. Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 3. Database Setup

Run the SQL migration in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase/migrations/001_create_photo_tables.sql`
4. Execute the query

This will create:

- `photo_sessions` table for session metadata
- `photos` table for individual photo records
- `photos` storage bucket for image files
- Necessary indexes and RLS policies

## 4. Storage Configuration

The migration automatically creates the `photos` storage bucket with public access. If you need to adjust permissions:

1. Go to Storage in your Supabase dashboard
2. Select the `photos` bucket
3. Configure policies as needed

## 5. Running the Application

```bash
pnpm dev
```

Navigate to `/photo-shoot` to start capturing photos!

## Features

- **4-Photo Sessions**: Capture exactly 4 photos per session
- **Real-time Preview**: See all captured photos in a grid layout
- **Progress Tracking**: Visual progress indicator and upload progress
- **Session Management**: Optional session naming and organization
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error handling with user feedback

## Database Schema

### photo_sessions

- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `session_name` (Text, Optional)
- `updated_at` (Timestamp)

### photos

- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key)
- `image_url` (Text)
- `order_number` (Integer, 1-4)
- `created_at` (Timestamp)

## Security Notes

The current setup uses public access policies for simplicity. For production use, consider:

1. Implementing user authentication
2. Adding user-specific RLS policies
3. Configuring rate limiting
4. Adding input validation and sanitization
5. Setting up proper CORS policies

## Troubleshooting

1. **Environment Variables**: Ensure `.env.local` is properly configured
2. **Database Tables**: Verify the migration ran successfully
3. **Storage Bucket**: Check that the `photos` bucket exists and has proper policies
4. **Browser Permissions**: Ensure camera permissions are granted
5. **Network**: Check that your app can connect to Supabase
