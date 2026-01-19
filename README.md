# UsapUs - Modern Messaging App

A real-time messaging application built with Next.js, Convex, Clerk, and shadcn/ui with a beautiful mint green theme and dark mode support.

## Features

✅ **Real-time Messaging**
- 1-on-1 and group conversations
- Instant message delivery with Convex real-time subscriptions
- Message reactions, replies, and forwarding
- Edit and delete messages

✅ **Rich Media Support**
- Image sharing
- File attachments
- Voice messages (browser recording)

✅ **Social Features**
- User search and profiles
- Friend requests system
- Friends list with online/offline status
- Typing indicators

✅ **Notifications**
- Real-time notifications for messages and friend requests
- Unread message counts per conversation
- Unread notification badges

✅ **Modern UI/UX**
- Mint green color palette
- Dark/light theme toggle
- Responsive design
- Smooth animations with shadcn/ui

## Tech Stack

- **Framework**: Next.js 16 with React 19
- **Backend**: Convex (real-time database)
- **Authentication**: Clerk
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Environment Variables
Create a `.env.local` file:
\`\`\`env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment
CLERK_FRONTEND_API_URL=your_clerk_frontend_url
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

## License
MIT
