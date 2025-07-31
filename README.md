# 🚀 GraphQL Profile Dashboard

> A modern, tech-focused profile dashboard built with Next.js 14+ and GraphQL. Authenticate, visualize, and explore your coding journey with interactive SVG charts and real-time data.

## 🎯 Project Overview

This project is a **personal profile dashboard** that leverages GraphQL to fetch and display user data from a school platform. It combines modern web technologies with data visualization to create an immersive experience for exploring your coding achievements and progress.

### ✨ Key Features

- 🔐 **JWT Authentication** - Secure login with username/email + password
- 📊 **Interactive SVG Charts** - Dynamic data visualization of your progress
- 🎨 **Modern UI/UX** - Clean, tech-themed interface built with Tailwind CSS
- ⚡ **Real-time Data** - Live GraphQL queries to fetch the latest user statistics
- 📱 **Responsive Design** - Optimized for all device sizes
- 🚀 **Next.js 14+** - Leveraging the latest App Router and server components

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **GraphQL** | Efficient data fetching and querying |
| **Tailwind CSS** | Utility-first CSS framework |
| **JWT** | Secure authentication tokens |
| **SVG** | Custom interactive charts and graphs |
| **Turbopack** | Ultra-fast development builds |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Access to the GraphQL endpoint
- Valid user credentials

### Installation

```bash
# Clone the repository
git clone 
https://learn.reboot01.com/git/sayuksel/graphql.git
cd graphql

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🔐 Authentication Flow

The application uses JWT-based authentication:

1. **Login Page** - Accepts both `username:password` and `email:password`
2. **Token Generation** - POST request to `/api/auth/signin` with Basic auth
3. **Secure Storage** - JWT stored in localStorage
4. **API Authorization** - Bearer token for GraphQL queries

```typescript
// Example authentication
const credentials = btoa(`${username}:${password}`);
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`
  }
});
```

## 📊 Data Visualization

### Available Charts
- 📈 **XP Progress Over Time** - Track your learning journey
- 🎯 **Project Success Rate** - PASS/FAIL ratio visualization
- 🔍 **Audit Statistics** - Performance metrics
- 💪 **Skills Distribution** - Technologies and competencies
- 🏊‍♂️ **Piscine Stats** - Bootcamp performance data

### GraphQL Queries

The dashboard queries multiple data sources:

```graphql
# User Profile Data
{
  user {
    id
    login
    email
  }
}

# XP Transactions
{
  transaction(where: { type: { _eq: "xp" }}) {
    amount
    createdAt
    path
    object {
      name
      type
    }
  }
}

# Project Progress
{
  progress {
    grade
    createdAt
    path
    object {
      name
      type
    }
  }
}
```

## 🎨 UI/UX Design Principles

- **Dark Theme** - Developer-friendly color scheme
- **Minimalist Layout** - Focus on data and functionality
- **Interactive Elements** - Hover effects and smooth transitions
- **Responsive Grid** - Adaptive layout for all screen sizes
- **Loading States** - Skeleton loaders for better UX
- **Error Handling** - Graceful error messages and recovery

## 📁 Project Structure

```
graphql/
├── app/
│   ├── login/           # Authentication page
│   ├── profile/         # User dashboard
│   ├── api/auth/        # Authentication API
│   └── globals.css      # Global styles
├── lib/
│   ├── auth.ts          # Authentication utilities
│   ├── graphql.ts       # GraphQL client setup
│   └── types.ts         # TypeScript definitions
├── components/
│   ├── charts/          # SVG chart components
│   ├── ui/              # Reusable UI components
│   └── layout/          # Layout components
└── public/              # Static assets
```

## 🔧 Development Features

- **Hot Module Replacement** - Instant code updates
- **TypeScript Integration** - Full type safety
- **ESLint & Prettier** - Code quality and formatting
- **Source Maps** - Enhanced debugging experience
- **Environment Variables** - Secure configuration management

## 📈 Available Data Points

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `user` | `id`, `login`, `email` | User identification |
| `transaction` | `type`, `amount`, `createdAt` | XP and progress tracking |
| `progress` | `grade`, `path`, `objectId` | Project completion status |
| `result` | `grade`, `type`, `updatedAt` | Exercise results |
| `object` | `name`, `type`, `attrs` | Project/exercise metadata |

## 🚀 Deployment

The application is ready for deployment on modern hosting platforms:

- **Vercel** (Recommended) - Seamless Next.js deployment
- **Netlify** - Static site hosting with serverless functions
- **GitHub Pages** - Free static hosting
- **Railway** - Full-stack deployment with databases

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## 🎯 Project Goals & Learning Outcomes

- ✅ **GraphQL Mastery** - Learn query language and best practices
- ✅ **JWT Authentication** - Implement secure user sessions
- ✅ **Data Visualization** - Create interactive SVG charts
- ✅ **Modern React** - Utilize Next.js 14+ features
- ✅ **UI/UX Design** - Build intuitive user interfaces
- ✅ **API Integration** - Connect frontend with GraphQL backend

## 📚 Resources

- [GraphQL Documentation](https://graphql.org/learn/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [SVG Charts Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [JWT.io](https://jwt.io/) - JWT token inspector
- [GraphiQL](https://github.com/graphql/graphiql) - GraphQL IDE


## 📄 License

This project is made by Salah Yuksel.

---

**Built with ❤️ using Next.js, GraphQL, and modern web technologies**


## To do:
- host it