# Photo Booth Next.js Application

A modern photo booth application built with Next.js that captures 4 photos per session and saves them to Supabase.

## Features

- **4-Photo Sessions**: Capture exactly 4 photos in sequence
- **Real-time Camera**: Live webcam feed with high-quality capture
- **Progress Tracking**: Visual progress indicators for both capture and upload
- **Photo Preview**: Grid layout showing all captured photos
- **Individual Retakes**: Delete and retake specific photos
- **Session Management**: Optional session naming and organization
- **Supabase Integration**: Automatic upload to cloud storage and database
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with TailwindCSS and Shadcn/UI components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: TailwindCSS, Shadcn/UI, Radix UI primitives
- **Camera**: react-webcam for photo capture
- **Backend**: Supabase (Database + Storage)
- **State Management**: Custom React hooks with local state

## Project Structure

```
├── app/
│   ├── photo-shoot/
│   │   └── page.tsx           # Main photo booth interface
│   ├── layout.tsx
│   └── page.tsx               # Home page
├── components/
│   └── ui/                    # Reusable UI components
│       ├── button.tsx
│       ├── progress.tsx
│       └── toast.tsx
├── hooks/
│   └── use-photo-session.ts   # Photo session management hook
├── lib/
│   ├── supabase.ts           # Supabase client configuration
│   └── utils.ts              # Utility functions
├── supabase/
│   └── migrations/
│       └── 001_create_photo_tables.sql  # Database schema
├── .env.example              # Environment variables template
├── SETUP.md                  # Setup instructions
└── README.md                 # This file
```

## Quick Start

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd photobooth-nextjs
   pnpm install
   ```

2. **Setup Supabase**

   - Create a Supabase project
   - Run the SQL migration from `supabase/migrations/001_create_photo_tables.sql`
   - Get your project URL and anon key

3. **Configure Environment**

   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Run Development Server**

   ```bash
   pnpm dev
   ```

5. **Open Photo Booth**
   Navigate to `http://localhost:3000/photo-shoot`

## Key Components

### Photo Capture Hook (`hooks/use-photo-session.ts`)

- Manages photo capture state
- Handles Supabase uploads
- Provides progress tracking
- File conversion utilities

### Photo Booth Interface (`app/photo-shoot/page.tsx`)

- Camera view with live preview
- Photo grid layout
- Upload progress indicators
- Session management controls

### Database Schema

- `photo_sessions`: Session metadata
- `photos`: Individual photo records with ordering
- Storage bucket: `photos` for image files

## User Flow

1. **Start Session**: User navigates to photo booth page
2. **Capture Photos**: Take photos one by one (1-4)
3. **Preview**: Automatic switch to preview after 4 photos
4. **Review**: Grid view with individual retake options
5. **Save**: Upload to Supabase with optional session naming
6. **Success**: Confirmation and reset for new session

## Development

The application follows modern React patterns:

- **TypeScript**: Full type safety
- **Custom Hooks**: Encapsulated logic
- **Component Composition**: Reusable UI components
- **Error Handling**: Graceful error states
- **Responsive Design**: Mobile-friendly interface

## Production Considerations

- Configure proper RLS policies in Supabase
- Set up authentication for private sessions
- Implement rate limiting
- Add input validation
- Configure CORS policies
- Set up monitoring and analytics

## License

MIT License - see LICENSE file for details
