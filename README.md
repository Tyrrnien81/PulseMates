# PulseMates

> **24-Hour Hackathon MVP** | Mental Health Voice Check-in App for College Students

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](docker/docker-compose.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](package.json)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-black?logo=expo)](apps/mobile)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](tsconfig.json)

**PulseMates** delivers a **60-second mental health voice check-in** experience that converts voice
to text, analyzes sentiment, generates personalized AI coaching, and returns audio guidance—all in
under 3 seconds.

---

## 🎯 **Project Overview**

### **Core Features**

- 🎤 **Voice Recording**: 60-second mental health check-ins
- 📝 **Real-time Transcription**: AssemblyAI speech-to-text with streaming
- 🎭 **Sentiment Analysis**: AI-powered emotion detection and scoring
- 🤖 **AI Coaching**: GPT-4 personalized guidance and coping strategies
- 🔊 **Voice Response**: Google Cloud TTS audio coaching delivery
- 📊 **Anonymous Analytics**: Stress pattern tracking without PII storage

### **Performance Targets**

- ⚡ **End-to-End Latency**: ≤ 3 seconds (voice stop → audio reply)
- 🎯 **Sentiment Accuracy**: ≥ 80% F1-score vs baseline
- 🚀 **Crash-Free Sessions**: ≥ 99% during demo
- 📈 **Demo Usage**: ≥ 30 anonymous logs for validation

---

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │───▶│   Node.js API   │───▶│   External APIs │
│                 │    │                 │    │                 │
│ • Voice Record  │    │ • /api/checkin  │    │ • AssemblyAI    │
│ • Audio Player  │    │ • Orchestration │    │ • OpenAI GPT-4  │
│ • Sentiment UI  │    │ • Error Handle  │    │ • Google TTS    │
│ • Coaching Card │    │ • Rate Limiting │    │ • MySQL         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**

1. **Audio Upload** → Multipart/form-data to `/api/checkin`
2. **Speech Processing** → AssemblyAI STT + Sentiment Analysis
3. **AI Coaching** → OpenAI GPT-4 generates personalized guidance
4. **Voice Synthesis** → Google Cloud TTS creates audio response
5. **Data Logging** → Anonymous stress scores stored in MySQL
6. **Response Delivery** → JSON + Audio URL returned to client

---

## 🚀 **Quick Start**

### **Prerequisites**

```bash
# System Requirements
Node.js ≥ 20.x
pnpm ≥ 9.x
Docker Desktop (for MySQL)

# External API Keys (Required)
AssemblyAI API Key
OpenAI API Key
Google Cloud TTS Service Account JSON
```

### **1. Environment Setup**

```bash
# Clone repository
git clone <repository-url>
cd PulseMates

# Install dependencies
pnpm install

# Start Docker MySQL
docker compose -f docker/docker-compose.yml up -d

# Configure environment variables
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your API keys
```

### **2. Database Migration**

```bash
# Run Prisma migration
cd apps/server
npx prisma migrate dev --name init

# Verify database
docker exec pulse_mates_mysql mysql -u root -proot -e "USE pulse_mates; SHOW TABLES;"
```

### **3. Start Development**

```bash
# Development servers (both API + Mobile)
pnpm dev

# Individual services
pnpm dev:server  # API Server → http://localhost:4000
pnpm dev:mobile  # React Native → Expo DevTools
```

---

## 🔧 **API Documentation**

### **Core Endpoint: `/api/checkin`**

#### **Request**

```http
POST /api/checkin
Content-Type: multipart/form-data

audio: <audio-file>  # wav/mp3/m4a, ≤10MB, ≤60s
```

#### **Response**

```typescript
interface CheckinResponse {
  success: boolean;
  data: {
    transcript: string; // AssemblyAI transcription
    sentiment: {
      score: number; // 0-1 normalized stress level
      label: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
    coaching: {
      breathingExercise: {
        title: string;
        instructions: string[];
        duration: number;
      };
      stretchExercise: {
        title: string;
        instructions: string[];
      };
      resources: {
        title: string;
        description: string;
        url: string;
        category: 'counseling' | 'meditation' | 'emergency';
      }[];
      motivationalMessage: string;
    };
    audioUrl: string; // Google TTS audio response
  };
  processingTime: number; // End-to-end latency (ms)
  error?: string;
}
```

### **Health Check Endpoints**

```bash
GET /ping                    # Basic server health
GET /api/health             # Service status + dependencies
```

---

## 🐳 **Docker Services**

### **Available Services**

```yaml
# MySQL Database
- Host: localhost:3306
- Database: pulse_mates
- User: root / Password: root

# Adminer (Web Database Manager)
- URL: http://localhost:8080
- Login: Server=mysql, User=root, Password=root
```

### **Docker Commands**

```bash
# Start all services
docker compose -f docker/docker-compose.yml up -d

# Check status
docker compose -f docker/docker-compose.yml ps

# View logs
docker compose -f docker/docker-compose.yml logs -f mysql

# Stop services
docker compose -f docker/docker-compose.yml down
```

---

## 📊 **Database Schema**

### **Core Table: `stress_logs`**

```sql
CREATE TABLE stress_logs (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  uuid       VARCHAR(36) NOT NULL,           -- Anonymous session ID
  score      DOUBLE NOT NULL,                -- Stress score (0-1)
  label      VARCHAR(16) NOT NULL,           -- Sentiment label
  created_at DATETIME(3) DEFAULT NOW(),      -- Timestamp

  INDEX idx_uuid (uuid),
  INDEX idx_created_at (created_at)
);
```

### **Analytics Queries**

```sql
-- Daily stress distribution
SELECT DATE(created_at) as date,
       AVG(score) as avg_stress,
       COUNT(*) as check_ins
FROM stress_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Sentiment breakdown
SELECT label, COUNT(*) as count,
       AVG(score) as avg_score
FROM stress_logs
GROUP BY label;
```

---

## 🔐 **Environment Variables**

### **Required Configuration (`apps/server/.env`)**

```bash
# External API Keys
ASSEMBLYAI_API_KEY=your_assemblyai_key
OPENAI_API_KEY=your_openai_key
GOOGLE_APPLICATION_CREDENTIALS=./path/to/google-service-account.json

# Database
DATABASE_URL=mysql://root:root@localhost:3306/pulse_mates

# Server Configuration
PORT=4000
NODE_ENV=development
JWT_SECRET=your-development-secret

# CORS (React Native)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,exp://localhost:8081

# File Upload Limits
MAX_AUDIO_SIZE=10485760    # 10MB
MAX_AUDIO_DURATION=60      # 60 seconds

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per window
```

---

## 🧪 **Testing & Quality**

### **Manual Testing**

```bash
# Test API health
curl http://localhost:4000/ping

# Test database connection
docker exec pulse_mates_mysql mysql -u root -proot -e "SELECT 'Connected!' as status;"

# Test audio upload (with sample file)
curl -X POST http://localhost:4000/api/checkin \
  -F "audio=@sample.wav" \
  -H "Content-Type: multipart/form-data"
```

### **Performance Monitoring**

- Response time logging in middleware
- Database query performance tracking
- External API latency monitoring
- Error rate tracking

---

## 🚀 **Development Status**

### **✅ Completed (Phase 1)**

- [x] Docker environment setup
- [x] MySQL database with Prisma ORM
- [x] Environment variables configuration
- [x] Basic API server with health checks
- [x] External API packages installation
- [x] Database schema migration

### **🎯 In Progress (Phase 2)**

- [ ] Audio upload endpoint (`/api/checkin`)
- [ ] Multipart form-data handling
- [ ] Error handling middleware
- [ ] Request logging and rate limiting

### **📋 Planned (Phase 3-6)**

- [ ] AssemblyAI speech-to-text integration
- [ ] OpenAI coaching generation
- [ ] Google Cloud TTS synthesis
- [ ] React Native mobile app UI
- [ ] Real-time sentiment visualization
- [ ] Performance optimization

---

## 📚 **Documentation**

### **Project Documentation**

- [📋 Product Requirements](docs/prd.md) - Complete feature specifications
- [🔧 Backend Implementation Plan](docs/plan-back.md) - Leo's development roadmap
- [📱 Frontend Implementation Plan](docs/plan-front.md) - Gabino's UI/UX plan

### **API Documentation**

- [📖 API Specifications](apps/server/README.md) - Complete endpoint documentation
- [🔧 Postman Collection](docs/postman/) - API testing collection (planned)

---

## 👥 **Team & Contributions**

| Developer  | Role          | Responsibilities                                          |
| ---------- | ------------- | --------------------------------------------------------- |
| **Leo**    | Backend Lead  | API orchestration, database, CI/CD, external integrations |
| **Gabino** | Frontend Lead | React Native UI/UX, audio components, animations          |

### **Development Workflow**

1. **Planning Phase**: Requirements analysis and architecture design
2. **Parallel Development**: Backend API + Frontend UI development
3. **Integration Phase**: End-to-end testing and optimization
4. **Demo Preparation**: Performance tuning and presentation

---

## 🛠️ **Tech Stack**

### **Backend**

- **Runtime**: Node.js 20.x with TypeScript
- **Framework**: Express.js with middleware
- **Database**: MySQL 8.0 with Prisma ORM
- **External APIs**: AssemblyAI, OpenAI GPT-4, Google Cloud TTS
- **DevOps**: Docker Compose, Adminer

### **Frontend**

- **Framework**: React Native with Expo
- **Language**: TypeScript with strict mode
- **Audio**: Expo Audio Recording/Playback
- **UI Library**: React Native Elements / NativeBase
- **State Management**: React Context / Zustand

### **Infrastructure**

- **Containerization**: Docker + Docker Compose
- **Database**: MySQL with automated migrations
- **API Documentation**: OpenAPI/Swagger (planned)
- **Testing**: Jest + Supertest (planned)

---

## 🏆 **Success Metrics**

| Metric                  | Target         | Status            |
| ----------------------- | -------------- | ----------------- |
| **End-to-End Latency**  | ≤ 3 seconds    | 🎯 In Development |
| **Sentiment Accuracy**  | ≥ 80% F1-score | 🎯 Testing Phase  |
| **Crash-Free Sessions** | ≥ 99%          | 🎯 Demo Ready     |
| **Anonymous Logs**      | ≥ 30 users     | 📊 Tracking       |
| **Judge Satisfaction**  | ≥ 4.5/5.0      | 🏆 Demo Day       |

---

## 📄 **License**

This project is developed for educational purposes as part of a 24-hour hackathon. All rights
reserved.

---

**🚀 Ready to transform mental health support with AI-powered voice coaching!**
