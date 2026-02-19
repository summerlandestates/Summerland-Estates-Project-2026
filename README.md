# Summerland Estates

A premium directory platform connecting verified luxury estate professionals with high-net-worth households worldwide.

## 🌟 Features

- **Modern UI/UX**: Professional design with orange/amber accents, smooth transitions, and responsive layout
- **Authentication**: Email/password and Google OAuth integration
- **User Profiles**: Comprehensive profiles for professionals, businesses, agencies, and estates
- **Search & Filter**: Advanced filtering by category, location, availability, and more
- **Messaging**: Real-time messaging between users
- **Reviews & Ratings**: Verified reviews and ratings system
- **Admin Dashboard**: Complete admin panel for user and content management
- **Secure**: Row Level Security (RLS) with Supabase

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## 📖 Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Routing**: React Router v6
- **State Management**: React Context API

## 📦 Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── lib/           # Utilities and Supabase client
│   ├── pages/         # Page components
│   └── types/         # TypeScript type definitions
├── supabase-schema.sql # Database schema
└── SETUP.md           # Detailed setup guide
```

## 🔐 Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗 Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## 📝 License

Proprietary and confidential.
