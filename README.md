# PulseMates

A healthcare/fitness application built with TypeScript + React Native + Node.js + MySQL

## 🏗️ Project Structure

```
pulse-mates/
├── apps/
│   ├── mobile/          # React Native (Expo) mobile app
│   └── server/          # Node.js Express API server
├── packages/            # Shared libraries (planned)
├── docker/              # Docker configuration
├── docs/                # Project documentation
└── .github/             # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.x
- pnpm ≥ 9.x
- Docker & Docker Compose
- iOS: Xcode ≥ 15 (for iOS development)
- Android: Android Studio + SDK 34 (for Android development)

### 1. Clone Repository and Install Dependencies

```bash
git clone <repository-url>
cd PulseMates
pnpm install
```

### 2. Database Setup

```bash
# Start MySQL Docker container
pnpm docker:up

# Setup environment variables
cp apps/server/.env.example apps/server/.env

# Run database migration
pnpm db:migrate
```

### 3. Start Development Servers

```bash
# Run both server and mobile app
pnpm dev

# Or run individually
pnpm dev:server  # API server (http://localhost:4000)
pnpm dev:mobile  # React Native app
```

## 📱 Running Mobile App

### iOS Simulator

```bash
cd apps/mobile
pnpm ios
```

### Android Emulator

```bash
cd apps/mobile
pnpm android
```

### Web Browser (for testing)

```bash
cd apps/mobile
pnpm web
```

## 🔧 Development Tools

### Linting and Formatting

```bash
pnpm lint        # Run ESLint with auto-fix
pnpm format      # Run Prettier formatting
pnpm lint:check  # Check linting only
pnpm format:check # Check formatting only
```

### Database Management

```bash
pnpm db:studio   # Launch Prisma Studio
pnpm db:reset    # Reset database
pnpm db:migrate  # Run migrations
```

### Testing

```bash
pnpm test        # Run all tests
```

## 🐳 Docker Usage

### Start MySQL + Adminer

```bash
pnpm docker:up
```

- MySQL: `localhost:3306`
- Adminer (Web DB management): `http://localhost:8080`

### Stop Docker

```bash
pnpm docker:down
```

## 🌐 API Endpoints

### Basic Endpoints

- `GET /ping` - Health check
- `GET /api/health` - Service status
- `POST /api/users` - Create user (example)

### Environment URLs

- **Development**: http://localhost:4000
- **Production**: TBD

## 📊 Database Schema

### Main Tables

- `users` - User information
- `profiles` - User profiles
- `posts` - Posts
- `health_metrics` - Health metrics
- `workout_sessions` - Workout sessions

See `apps/server/prisma/schema.prisma` for detailed schema

## 🔐 Environment Variables

Copy `apps/server/.env.example` to create `.env` file:

```bash
DATABASE_URL="mysql://root:root@localhost:3306/pulse_mates"
PORT=4000
NODE_ENV=development
JWT_SECRET="your-secret-key"
```

## 🤝 Development Guidelines

### Commit Rules

- Husky pre-commit hooks automatically run linting and formatting
- Write clear and specific commit messages

### Code Style

- Use TypeScript strict mode
- Follow ESLint + Prettier configurations
- Adhere to React Native style guidelines

### Branch Strategy

- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature development branches

## 🚀 Deployment

### CI/CD

Automated build and testing using GitHub Actions:

- Linting, formatting, type checking
- Unit test execution
- Database migration testing
- Build artifact generation

## 📚 Additional Documentation

- [API Documentation](docs/api.md) (planned)
- [Mobile App Guide](docs/mobile.md) (planned)
- [Database Guide](docs/database.md) (planned)

## 🛠️ Tech Stack

### Frontend (Mobile)

- React Native + Expo
- TypeScript
- React Navigation

### Backend

- Node.js + Express
- TypeScript
- Prisma ORM
- Zod (validation)

### Database

- MySQL 8.0

### DevOps

- Docker & Docker Compose
- GitHub Actions
- ESLint + Prettier
- Husky + lint-staged

## 📝 License

TBD

## 👥 Contributors

- [Your Name](https://github.com/yourusername)

---

🏃‍♂️ Happy coding with PulseMates!
