# PulseMates API Server Documentation

> **Backend API for PulseMates Mental Health Check-in Application**  
> **Version:** 1.0.0  
> **Environment:** Development  
> **Last Updated:** 2025-01-09

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.x
- Docker & Docker Compose
- MySQL database

### Installation & Setup

1. **Install Dependencies**

   ```bash
   cd apps/server
   npm install
   ```

2. **Environment Configuration**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Add your API keys to .env file
   ```

3. **Database Setup**

   ```bash
   # Start MySQL with Docker
   docker compose -f ../../docker/docker-compose.yml up -d

   # Run database migrations
   npm run db:migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

Server will be running at: `http://localhost:4000`

---

## 📋 API Endpoints

### Health Check Endpoints

#### GET `/ping`

Basic server health check.

**Response:**

```json
{
  "pong": true,
  "message": "PulseMates API Server is running!",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

#### GET `/api/health`

Detailed system health status.

**Response:**

```json
{
  "status": "healthy",
  "service": "PulseMates API",
  "version": "1.0.0",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

---

## 🎤 Core API Endpoint

### POST `/api/checkin`

**Primary endpoint for mental health voice check-in processing.**

Processes uploaded audio file through the complete pipeline:

1. Speech-to-Text transcription
2. Sentiment analysis
3. AI coaching generation
4. Text-to-Speech synthesis
5. Anonymous logging

#### Request Format

```
Content-Type: multipart/form-data
```

**Parameters:**

- `audio` (file, required): Audio file (wav, mp3, m4a)
  - Max size: 10MB
  - Max duration: 60 seconds

#### Response Schema

**Success Response (200):**

```typescript
interface CheckinResponse {
  success: true;
  data: {
    sessionId: string; // UUID for this session
    transcript: string; // Transcribed text from audio
    sentiment: {
      score: number; // Sentiment score (0-1, lower = negative)
      label: 'positive' | 'negative' | 'neutral';
      confidence: number; // Sentiment confidence (0-1)
    };
    coaching: {
      breathingExercise: {
        title: string;
        instructions: string[];
        duration: number; // Duration in seconds
      };
      stretchExercise: {
        title: string;
        instructions: string[];
        imageUrl?: string;
      };
      resources: Array<{
        title: string;
        description: string;
        url: string;
        category: 'counseling' | 'meditation' | 'emergency';
      }>;
      motivationalMessage: string;
    };
    audioUrl: string; // URL to generated coaching audio (mp3)
  };
  processingTime: number; // Total processing time in ms
}
```

**Error Response (4xx/5xx):**

```typescript
interface ErrorResponse {
  success: false;
  error: string; // Error message
  code?: string; // Error code
  details?: any; // Additional error details
  timestamp: string; // ISO timestamp
}
```

#### Example Request (cURL)

```bash
curl -X POST http://localhost:4000/api/checkin \
  -F "audio=@voice_recording.wav" \
  -H "Content-Type: multipart/form-data"
```

#### Example Success Response

```json
{
  "success": true,
  "data": {
    "sessionId": "91edb2fc-ae1b-4dde-a4ca-76b8643dd3c3",
    "transcript": "I've been feeling a bit stressed lately with all the assignments and exams coming up.",
    "sentiment": {
      "score": 0.31,
      "label": "negative",
      "confidence": 0.85
    },
    "coaching": {
      "breathingExercise": {
        "title": "4-7-8 Breathing Technique",
        "instructions": [
          "Inhale through your nose for 4 counts",
          "Hold your breath for 7 counts",
          "Exhale through your mouth for 8 counts",
          "Repeat 4 times for maximum effect"
        ],
        "duration": 120
      },
      "stretchExercise": {
        "title": "Neck and Shoulder Release",
        "instructions": [
          "Slowly roll your shoulders backward 5 times",
          "Gently tilt your head to the right, hold 15 seconds",
          "Repeat on the left side",
          "Take deep breaths during each stretch"
        ]
      },
      "resources": [
        {
          "title": "University Counseling Center",
          "description": "Free confidential counseling services for students",
          "url": "https://university.edu/counseling",
          "category": "counseling"
        },
        {
          "title": "Headspace for Students",
          "description": "Free meditation and mindfulness app",
          "url": "https://headspace.com/students",
          "category": "meditation"
        },
        {
          "title": "Crisis Text Line",
          "description": "24/7 mental health crisis support via text",
          "url": "https://crisistextline.org",
          "category": "emergency"
        }
      ],
      "motivationalMessage": "Thank you for sharing what's on your mind. It's completely normal to feel stressed about exams and assignments - many students experience this. Remember that you have the strength to handle these challenges, and taking time for self-care like breathing exercises can really help. You're taking a positive step by checking in with yourself."
    },
    "audioUrl": "https://api.pulsemates.com/audio/91edb2fc-ae1b-4dde-a4ca-76b8643dd3c3.mp3"
  },
  "processingTime": 3876
}
```

---

## 🔧 Development Information

### Technology Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MySQL with Prisma ORM
- **External APIs:**
  - AssemblyAI (Speech-to-Text + Sentiment Analysis)
  - OpenAI GPT-4o-mini (Optimized AI Coaching Generation)
  - Google Cloud TTS (Text-to-Speech)

### Performance Optimization Features

#### Dual-Mode Coaching System

The API supports two coaching generation modes:

1. **Fast Mode (Default)** - 0ms coaching generation
   - Uses pre-cached responses for instant results
   - Recommended for demos and high-throughput scenarios
   - Provides consistent, tested coaching content

2. **Optimized Mode** - ~1.5s coaching generation
   - Uses GPT-4o-mini for personalized responses
   - 20x faster than GPT-4 while maintaining quality
   - Recommended for production with personalization

**Configuration:**

```bash
# Set coaching mode in environment variables
COACHING_MODE=fast        # Default: instant cached responses
COACHING_MODE=optimized   # AI-generated personalized coaching
```

#### Performance Metrics Achieved

- **Total Response Time:** 5.26s (improved from 27.99s - 81% improvement)
- **STT + Sentiment:** ~7s (AssemblyAI real-time processing)
- **Fast Coaching:** 0ms (cached responses)
- **Optimized Coaching:** ~1.5s (GPT-4o-mini)
- **TTS Generation:** ~300-600ms (Google Cloud TTS)

### Database Schema

#### StressLog Table

```prisma
model StressLog {
  id        Int      @id @default(autoincrement())
  uuid      String   @db.VarChar(36)      // Session UUID (anonymous)
  score     Float                         // Sentiment score (0-1)
  label     String   @db.VarChar(16)      // Sentiment label
  createdAt DateTime @default(now())      // Timestamp
}
```

### Performance Targets

- **Response Time:**
  - **Fast Mode:** ≤ 8 seconds (achieved: 5.26s)
  - **Optimized Mode:** ≤ 10 seconds (target with personalization)
  - **Target Goal:** ≤ 3 seconds (achievable with STT streaming)
- **Concurrent Users:** ≥ 100 users
- **Uptime:** ≥ 99.5%
- **API Success Rate:** ≥ 98%
- **Sentiment Accuracy:** ≥ 85% (achieved: 86%)

---

## 🚨 Phase 4: Enhanced AI Coaching & Crisis Detection

### Crisis Detection System

The API now includes automatic crisis detection for severe negative emotional states:

#### Crisis Detection Logic

```typescript
// Crisis is detected when:
const isCrisis = sentiment.score < 0.2 && sentiment.label === 'negative';
```

**When crisis is detected:**

- Emergency resources are prioritized first
- Professional crisis messaging is provided
- Fast coaching mode is automatically used for immediate response
- Additional safety checks are logged

#### Crisis Response Example

```json
{
  "coaching": {
    "motivationalMessage": "Your feelings are valid and important. You don't have to face this alone. Please reach out to the emergency resources listed below or call 911 if you're in immediate danger. Professional support is available 24/7 to help you through this difficult time.",
    "resources": [
      {
        "title": "Student Affairs – Get Help Now",
        "description": "Quick access page for immediate help in emergencies, including medical, mental health, or safety crises. Directs to 911 and campus resources.",
        "url": "https://students.wisc.edu/guides/get-help-now/",
        "category": "emergency"
      },
      {
        "title": "UHS Mental Health Services",
        "description": "Provides free and confidential mental health services for students, including individual, group, and couples counseling, crisis support, and mental health management.",
        "url": "https://www.uhs.wisc.edu/mental-health/",
        "category": "counseling"
      }
    ]
  }
}
```

### University Resources Integration

**Real UW-Madison Mental Health Resources (9 total):**

#### Counseling Services (3)

- **UHS Mental Health Services** - Free confidential services
- **UHS Individual Counseling** - One-on-one professional support
- **Counseling Psychology Training Clinic** - Low-cost community services

#### Mindfulness & Meditation (3)

- **UW Mindfulness & Meditation Classes** - Campus recreation center classes
- **Center for Healthy Minds** - Free guided meditations and apps
- **UW Health Mindfulness Program** - Clinical mindfulness programs

#### Emergency Resources (3)

- **Student Affairs – Get Help Now** - Crisis emergency access
- **UW–Madison Emergency Procedures** - Campus emergency protocols
- **Emergency Management – UW Police** - Crisis response and training

### Intelligent Resource Selection

The API automatically selects appropriate resources based on emotional state:

| Sentiment Score | Label    | Selected Resources          | User Experience                |
| --------------- | -------- | --------------------------- | ------------------------------ |
| < 0.2           | negative | **Emergency + Counseling**  | Crisis intervention priority   |
| 0.2 - 0.4       | negative | **Counseling + Meditation** | Professional support focus     |
| 0.4 - 0.6       | neutral  | **Meditation + Preventive** | Proactive wellness maintenance |
| > 0.6           | positive | **Meditation + Growth**     | Positive state reinforcement   |

### Enhanced Coaching Content

#### Professional Breathing Exercises

- **4-7-8 Stress Relief Breathing** - Clinical anxiety reduction technique
- **Mindful Daily Breathing** - Meditation-based awareness practice
- **Energy Enhancement Breathing** - Positive state amplification

#### Therapeutic Stretch Instructions

- **Tension Relief Stretches** - Physical stress release techniques
- **Energizing Workplace Stretches** - Productivity and focus improvement
- **Vitality Flow Stretches** - Positive energy cultivation

### API Response Changes for Frontend

**New Resource Categories:**

```typescript
type ResourceCategory = 'counseling' | 'meditation' | 'emergency';
```

**Enhanced Motivational Messages:**

- Crisis-safe language for emergency situations
- Professional tone matching emotional severity
- Empathetic acknowledgment of user feelings

**Example Integration Code:**

```typescript
// Check for crisis response
if (response.data.sentiment.score < 0.2 && response.data.sentiment.label === 'negative') {
  // Handle crisis UI - show emergency resources prominently
  showEmergencyAlert(response.data.coaching.resources);

  // Use crisis-specific styling
  applyEmergencyTheme();
}

// Resource categorization for UI
const emergencyResources = response.data.coaching.resources.filter(r => r.category === 'emergency');
const counselingResources = response.data.coaching.resources.filter(
  r => r.category === 'counseling'
);
const meditationResources = response.data.coaching.resources.filter(
  r => r.category === 'meditation'
);
```

---

## 🚨 Error Handling

### Common Error Codes

| HTTP Status | Error Code                | Description                   | Solution                   |
| ----------- | ------------------------- | ----------------------------- | -------------------------- |
| 400         | `INVALID_FILE_FORMAT`     | Unsupported audio format      | Use wav, mp3, or m4a files |
| 400         | `FILE_TOO_LARGE`          | File exceeds 10MB limit       | Compress audio file        |
| 400         | `DURATION_TOO_LONG`       | Audio longer than 60s         | Trim audio to 60 seconds   |
| 429         | `RATE_LIMIT_EXCEEDED`     | Too many requests             | Wait before retrying       |
| 500         | `STT_SERVICE_ERROR`       | Speech-to-text failed         | Retry with clearer audio   |
| 500         | `SENTIMENT_SERVICE_ERROR` | Sentiment analysis failed     | Retry request              |
| 500         | `COACHING_SERVICE_ERROR`  | AI coaching generation failed | Retry request              |
| 500         | `TTS_SERVICE_ERROR`       | Text-to-speech failed         | Retry request              |
| 503         | `SERVICE_UNAVAILABLE`     | External API unavailable      | Try again later            |

### Error Response Examples

**File Format Error:**

```json
{
  "success": false,
  "error": "Invalid file format. Please upload wav, mp3, or m4a files only.",
  "code": "INVALID_FILE_FORMAT",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

**Rate Limit Error:**

```json
{
  "success": false,
  "error": "Too many requests. Please try again in 60 seconds.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60,
    "requestsRemaining": 0
  },
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

---

## 🧪 Testing

### Testing Endpoints

You can test the API using the following methods:

#### 1. Using cURL

```bash
# Health check
curl http://localhost:4000/ping

# Audio upload test
curl -X POST http://localhost:4000/api/checkin \
  -F "audio=@test_audio.wav"
```

#### 2. Using Postman

1. Create new POST request to `http://localhost:4000/api/checkin`
2. Set body type to `form-data`
3. Add key `audio` with type `File`
4. Upload your audio file

#### 3. Sample Audio Files

Create test audio files with these characteristics:

- **Format:** WAV, MP3, or M4A
- **Duration:** 5-30 seconds
- **Content:** English speech expressing various emotions
- **Quality:** Clear speech, minimal background noise

---

## 🔐 Security & Privacy

### Data Protection

- **No PII Storage:** Only anonymous sentiment scores are stored
- **Session Tracking:** UUID-based anonymous session identification
- **API Keys:** Stored securely in environment variables
- **Rate Limiting:** 100 requests per 15-minute window per IP

### CORS Configuration

- **Development:** Allows localhost:3000, localhost:8081, exp://localhost:8081
- **Production:** Configured based on ALLOWED_ORIGINS environment variable

---

## 📞 Integration Guide for Frontend

### Quick Integration Steps

1. **Install HTTP Client** (React Native)

   ```bash
   npm install axios
   ```

2. **Create API Service**

   ```typescript
   import axios from 'axios';

   const API_BASE_URL = 'http://localhost:4000';

   export const uploadAudio = async (audioFile: File) => {
     const formData = new FormData();
     formData.append('audio', audioFile);

     const response = await axios.post(`${API_BASE_URL}/api/checkin`, formData, {
       headers: {
         'Content-Type': 'multipart/form-data',
       },
       timeout: 30000, // 30 second timeout
     });

     return response.data;
   };
   ```

3. **Handle Response Data**

   ```typescript
   const handleAudioUpload = async (audioFile: File) => {
     try {
       const result = await uploadAudio(audioFile);

       // Use transcript for real-time display
       console.log('Transcript:', result.data.transcript);

       // Use sentiment for UI theming
       console.log('Sentiment:', result.data.sentiment);

       // Display coaching content
       console.log('Coaching:', result.data.coaching);

       // Play audio response
       console.log('Audio URL:', result.data.audioUrl);
     } catch (error) {
       console.error('Upload failed:', error.response?.data);
     }
   };
   ```

### Real-time Updates (Future)

WebSocket endpoint will be available at: `ws://localhost:4000/ws/checkin`

---

## 🛠️ Development & Deployment

### Environment Variables Required

```bash
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# External API Keys
ASSEMBLYAI_API_KEY="your_assemblyai_key"
OPENAI_API_KEY="your_openai_key"
GOOGLE_APPLICATION_CREDENTIALS="./path/to/google-credentials.json"

# Server Configuration
PORT=4000
NODE_ENV=development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8081"

# Performance Configuration
COACHING_MODE=fast  # Options: fast (0ms cached) | optimized (~1.5s AI)
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
```

---

## 📝 Changelog

### Version 1.0.0 (2025-01-09)

- Initial API implementation
- `/api/checkin` endpoint with complete pipeline
- AssemblyAI integration for STT + Sentiment
- OpenAI integration for coaching generation
- Google Cloud TTS integration
- Anonymous analytics logging
- Error handling and rate limiting

---

## 🤝 Support & Contact

For technical questions or issues:

- **Backend Developer:** Leo
- **Frontend Integration:** Gabino
- **Documentation Updates:** Update this README.md file

**Response Time Target:** ≤ 2.5 seconds average  
**Monitoring:** Health checks available at `/api/health`
