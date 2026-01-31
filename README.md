# Personal Study Manager

A comprehensive web application for tech job preparation. Track your learning progress across DSA, System Design, and Core CS subjects while integrating with LeetCode and Codeforces for daily problem-solving tasks.

## Features

- **Curriculum Tracking** - Monitor progress across 10 subjects: DSA, Competitive Programming, OS, OOPS, DBMS, CN, LLD, HLD, DevOps, and AI
- **Platform Integration** - Connect LeetCode and Codeforces accounts to fetch problems and track stats
- **Smart Task Generation** - Get personalized daily tasks based on your preferences and progress
- **Progress Visualization** - Activity heatmap, streaks, and progress bars
- **Spaced Repetition** - Review tasks automatically scheduled for optimal retention
- **Theme Support** - Light, dark, and system theme modes
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (credentials provider)
- **Styling**: CSS Modules with CSS Variables
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/17kaushalsingh/personal-study-manager.git
   cd personal-study-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/study_manager"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Create database tables
   npm run db:push

   # Seed with default subjects and topics
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000) and create an account to get started.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with subjects |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── dashboard/     # Dashboard data
│   │   ├── subjects/      # Subject CRUD
│   │   ├── tasks/         # Task management
│   │   └── user/          # User preferences
│   ├── dashboard/         # Dashboard page
│   ├── curriculum/        # Curriculum page
│   ├── settings/          # Settings page
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # Reusable UI components
│   ├── Button/
│   ├── Card/
│   ├── Heatmap/
│   ├── Header/
│   ├── MobileNav/
│   ├── ProgressBar/
│   ├── Sidebar/
│   ├── Skeleton/
│   ├── SubjectCard/
│   ├── TaskCard/
│   └── Toast/
├── context/               # React contexts
│   └── ThemeContext.tsx
├── lib/                   # Utilities and API clients
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── leetcode.ts       # LeetCode API client
│   ├── codeforces.ts     # Codeforces API client
│   ├── taskGenerator.ts  # Task generation algorithm
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript types
    └── index.ts
```

## Database Schema

The app uses the following main models:

- **User** - User accounts with preferences
- **Subject** - Study subjects (DSA, OS, etc.)
- **Topic** - Topics within each subject
- **Task** - Daily tasks (problems and learning)
- **ActivityLog** - Daily activity tracking
- **UserSubject** - User progress per subject

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/subjects` | GET | List all subjects |
| `/api/subjects/[id]/topics` | GET | Get topics for a subject |
| `/api/tasks` | GET | Get user's tasks |
| `/api/tasks/generate` | POST | Generate daily tasks |
| `/api/tasks/[id]` | PUT | Update task status |
| `/api/dashboard` | GET | Get dashboard data |
| `/api/user/preferences` | GET/PUT | User preferences |
| `/api/platforms/stats` | POST | Verify platform username |

## Configuration

### User Preferences

Users can configure:
- **LeetCode Username** - For fetching problems and stats
- **Codeforces Handle** - For competitive programming problems
- **Daily Problems** - Number of problems per day (1-5)
- **Learning Time** - Daily learning target in minutes
- **Difficulty Preference** - Easy, Medium, Hard, or Balanced
- **Include Daily Challenge** - Include LeetCode's daily problem

### Task Generation

The smart task generator:
- Fetches problems from LeetCode based on difficulty preference
- Assigns learning tasks from in-progress subjects
- Creates review tasks using spaced repetition intervals (1, 3, 7, 14, 30 days)
- Avoids recommending already-completed problems

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPatterns="taskGenerator"
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build the image
docker build -t study-manager .

# Run the container
docker run -p 3000:3000 study-manager
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [LeetCode](https://leetcode.com) for the problem database
- [Codeforces](https://codeforces.com) for competitive programming problems
- [Next.js](https://nextjs.org) for the amazing framework
- [Prisma](https://prisma.io) for the database toolkit
