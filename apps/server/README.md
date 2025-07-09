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
    transcript: string; // Transcribed text
    confidence: number; // Transcription confidence (0-1)
    sentiment: {
      score: number; // Sentiment score (0-1)
      label: 'positive' | 'negative' | 'neutral';
      confidence: number; // Sentiment confidence (0-1)
    };
    coaching: {
      breathingExercise: {
        title: string;
        instructions: string[];
        duration: number; // Duration in minutes
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
    audioUrl: string; // URL to generated coaching audio
    audioMetadata: {
      duration: number; // Audio duration in seconds
      fileSize: number; // File size in bytes
      format: 'mp3' | 'wav';
    };
  };
  processingTime: number; // Total processing time in ms
  timestamp: string; // ISO timestamp
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
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "transcript": "I'm feeling really stressed about my upcoming exams and I can't seem to focus on studying.",
    "confidence": 0.94,
    "sentiment": {
      "score": 0.25,
      "label": "negative",
      "confidence": 0.89
    },
    "coaching": {
      "breathingExercise": {
        "title": "4-7-8 Calming Breath",
        "instructions": [
          "Sit comfortably with your back straight",
          "Inhale through your nose for 4 counts",
          "Hold your breath for 7 counts",
          "Exhale through your mouth for 8 counts",
          "Repeat this cycle 4 times"
        ],
        "duration": 5
      },
      "stretchExercise": {
        "title": "Neck and Shoulder Release",
        "instructions": [
          "Gently tilt your head to the right, hold for 15 seconds",
          "Repeat on the left side",
          "Roll your shoulders backward 5 times",
          "Take deep breaths throughout"
        ]
      },
      "resources": [
        {
          "title": "Campus Counseling Center",
          "description": "Free counseling services for students",
          "url": "https://counseling.university.edu",
          "category": "counseling"
        },
        {
          "title": "Headspace - Study Focus",
          "description": "Meditation sessions designed for students",
          "url": "https://headspace.com/study",
          "category": "meditation"
        }
      ],
      "motivationalMessage": "Remember, feeling stressed about exams is completely normal. You've prepared well, and taking breaks to breathe and stretch will actually help you focus better. You've got this!"
    },
    "audioUrl": "http://localhost:4000/audio/coaching-550e8400-e29b-41d4.mp3",
    "audioMetadata": {
      "duration": 45.6,
      "fileSize": 1024000,
      "format": "mp3"
    }
  },
  "processingTime": 2347,
  "timestamp": "2025-01-09T10:30:00.000Z"
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
  - OpenAI GPT-4 (AI Coaching Generation)
  - Google Cloud TTS (Text-to-Speech)

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

- **Response Time:** ≤ 2.5 seconds average
- **Concurrent Users:** ≥ 100 users
- **Uptime:** ≥ 99.5%
- **API Success Rate:** ≥ 98%

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
