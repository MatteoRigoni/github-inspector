# 🚀 GitHub Inspector

<div align="center">

**AI-Powered GitHub Repository Analysis Platform**

*Intelligent repository insights powered by OpenAI and LangChain*

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

</div>

---

## 📋 Overview

**GitHub Inspector** is a modern, full-stack web application that leverages AI to analyze GitHub repositories and extract meaningful insights. The platform provides intelligent summaries, key facts extraction, and comprehensive repository analysis through an intuitive dashboard interface.

### Key Features

✨ **AI-Powered Analysis** - Automatically generates intelligent summaries and extracts key insights from GitHub README files using OpenAI GPT-4  
🔐 **Secure Authentication** - Google SSO integration with Next-Auth for seamless user experience  
💳 **Credit-Based System** - Flexible tiered pricing model (Free, Starter, Pro) with credit tracking  
🔑 **API Key Management** - Complete CRUD operations for API keys with usage tracking and quota management  
📊 **Real-Time Dashboard** - Beautiful, responsive dashboard with usage statistics and analytics  
🎨 **Modern UI/UX** - Clean, professional interface built with Tailwind CSS and dark mode support  

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16.1** - React framework with App Router
- **React 19.2** - Latest React with concurrent features
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Next-Auth 4.24** - Authentication and session management

### Backend & AI
- **LangChain 1.2** - AI application framework
- **OpenAI GPT-4o-mini** - Large language model for repository analysis
- **Next.js API Routes** - Serverless API endpoints

### Database & Infrastructure
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Database-level security policies

### Authentication
- **Google OAuth 2.0** - Social authentication provider
- **JWT Sessions** - Secure session management

---

## 🎯 Core Functionality

### 1. Repository Analysis
- Fetches README content from GitHub repositories
- Generates comprehensive summaries using AI
- Extracts interesting facts and key insights
- Structured output with JSON schema validation

### 2. API Key Management
- Create, read, update, and delete API keys
- Usage tracking and quota management
- Credit-based consumption model
- Plan-based limits (Free: 5, Starter: 100, Pro: 1000 credits)

### 3. User Management
- Google SSO authentication
- User profile tracking
- Login history and analytics
- Tiered subscription plans

### 4. Dashboard & Analytics
- Real-time credit usage monitoring
- API key statistics by type (Development/Production)
- Usage progress visualization
- Responsive design with dark mode

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google OAuth credentials
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd github-inspector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file:
   ```env
   # Next-Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
   
   # OpenAI
   OPENAI_API_KEY=your-openai-key
   ```

4. **Set up database**
   - Run SQL migrations in Supabase SQL Editor
   - Create `users` and `api_keys` tables

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
github-inspector/
├── app/
│   ├── api/
│   │   ├── auth/          # Next-Auth configuration
│   │   ├── api-keys/       # API key CRUD operations
│   │   └── github/         # GitHub analysis endpoints
│   ├── components/         # Reusable React components
│   ├── github-research/    # Repository analysis page
│   ├── pricing/            # Subscription plans page
│   └── settings/           # User settings
├── lib/
│   ├── auth.ts            # Next-Auth configuration
│   ├── users.ts           # User management functions
│   └── supabase.ts        # Supabase client
└── types/
    └── next-auth.d.ts     # TypeScript definitions
```

---

## 🔮 Future Enhancements

- [ ] Payment integration for plan upgrades
- [ ] Advanced analytics dashboard
- [ ] Repository comparison features
- [ ] Export functionality for reports
- [ ] Webhook support for real-time updates
- [ ] Multi-language support
