# PulseMates API Testing Guide with Postman

> **Frontend Developer API Testing Documentation**  
> **Version:** 1.0.0  
> **Last Updated:** 2025-01-09  
> **Postman Collection:** `PulseMates-API.postman_collection.json`

---

## 🚀 Quick Setup

### Import Postman Collection

1. **Download Collection File**

   ```
   docs/postman/PulseMates-API.postman_collection.json
   ```

2. **Import to Postman**
   - Open Postman
   - Click "Import" button
   - Select the collection file
   - Collection will appear in your workspace

3. **Set Environment Variables**
   ```
   BASE_URL = http://localhost:4000
   API_VERSION = v1
   ```

---

## 📋 Available API Endpoints

### 1. Health Check Endpoints

#### GET `/ping`

**Purpose:** Basic server connectivity test  
**Use Case:** Verify server is running  
**Expected Response Time:** < 50ms

```json
{
  "pong": true,
  "message": "PulseMates API Server is running!",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

#### GET `/api/health`

**Purpose:** Detailed system status  
**Use Case:** Pre-deployment health verification  
**Expected Response Time:** < 100ms

```json
{
  "status": "healthy",
  "service": "PulseMates API",
  "version": "1.0.0",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

### 2. Core Voice Check-in Endpoint

#### POST `/api/checkin`

**Purpose:** Complete voice processing pipeline  
**Use Case:** Primary app functionality  
**Expected Response Time:** 5-8 seconds (fast mode), 8-12 seconds (optimized mode)

---

## 🎤 Testing Voice Check-in Endpoint

### Request Configuration

1. **Method:** POST
2. **URL:** `{{BASE_URL}}/api/checkin`
3. **Body Type:** form-data
4. **Required Parameter:**
   - Key: `audio`
   - Type: File
   - Value: Upload audio file

### 🎛️ Coaching Mode Control (3 Options)

**Option 1: Query Parameter (Recommended for Testing)**

```
{{BASE_URL}}/api/checkin?mode=fast        # 0ms coaching (demo)
{{BASE_URL}}/api/checkin?mode=optimized   # 1.5s coaching (production)
```

**Option 2: HTTP Header (Good for App Configuration)**

```
Headers:
X-Coaching-Mode: fast      # or optimized
```

**Option 3: Environment Variable (Server Default)**

```bash
# Server .env file
COACHING_MODE=fast  # Default server setting
```

**Mode Comparison:**

| Mode        | Speed | Use Case                 | Response Time |
| ----------- | ----- | ------------------------ | ------------- |
| `fast`      | 0ms   | Demos, High-throughput   | 5-6 seconds   |
| `optimized` | ~1.5s | Production, Personalized | 7-9 seconds   |

### Supported Audio Formats

| Format | Recommended | Max Size | Max Duration | 30s Audio          |
| ------ | ----------- | -------- | ------------ | ------------------ |
| WAV    | ✅ Best     | 10MB     | 60 seconds   | ✅ Fully Supported |
| MP3    | ✅ Good     | 10MB     | 60 seconds   | ✅ Fully Supported |
| M4A    | ✅ Good     | 10MB     | 60 seconds   | ✅ Fully Supported |

**📝 Audio Duration Guidelines:**

- **Recommended:** 10-30 seconds for optimal processing speed
- **30-second audio:** Fully supported and tested ✅
- **Maximum:** 60 seconds (system limit)
- **Processing time:** Independent of audio duration (same ~5-8s response time)

### Test Audio Files

Create test files with these characteristics:

#### Negative Sentiment Test

```
Content: "I'm feeling stressed about my exams and assignments"
Duration: 5-10 seconds
Expected Sentiment: negative (score: 0.1-0.4)
```

#### Positive Sentiment Test

```
Content: "I'm feeling great today and accomplished a lot"
Duration: 5-10 seconds
Expected Sentiment: positive (score: 0.7-1.0)
```

#### Neutral Sentiment Test

```
Content: "Today was an ordinary day, nothing special happened"
Duration: 5-10 seconds
Expected Sentiment: neutral (score: 0.4-0.7)
```

---

## 📊 Response Data Structure

### Success Response (200 OK)

```typescript
{
  "success": true,
  "data": {
    "sessionId": "uuid-string",           // Session identifier
    "transcript": "transcribed text",     // STT result
    "sentiment": {
      "score": 0.31,                     // 0=negative, 1=positive
      "label": "negative",               // negative|neutral|positive
      "confidence": 0.86                 // Sentiment confidence
    },
    "coaching": {
      "breathingExercise": {
        "title": "Exercise name",
        "instructions": ["step1", "step2"], // Array of steps
        "duration": 300                    // Seconds
      },
      "stretchExercise": {
        "title": "Stretch name",
        "instructions": ["step1", "step2"]
      },
      "resources": [{
        "title": "Resource title",
        "description": "Description",
        "url": "https://...",
        "category": "counseling|meditation|emergency"
      }],
      "motivationalMessage": "Encouraging message..."
    },
    "audioUrl": "https://api.pulsemates.com/audio/uuid.mp3"
  },
  "processingTime": 5260               // Total time in milliseconds
}
```

### Error Response Examples

#### File Format Error (400)

```json
{
  "success": false,
  "error": "Invalid file format. Allowed formats: .wav, .mp3, .m4a",
  "code": "INVALID_FILE_FORMAT",
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

#### File Too Large Error (400)

```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 10MB",
  "code": "FILE_TOO_LARGE",
  "details": {
    "fileSize": "15.2MB",
    "maxSize": "10MB"
  },
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

#### Rate Limit Error (429)

```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60,
    "requestsRemaining": 0
  },
  "timestamp": "2025-01-09T10:30:00.000Z"
}
```

---

## 🧪 Testing Scenarios for Frontend

### 1. Happy Path Testing

**Scenario:** Normal voice check-in flow

```
1. Upload valid audio file (WAV, 5-10 seconds, clear speech)
2. Verify 200 response
3. Check all required fields are present
4. Validate sentiment score range (0-1)
5. Confirm coaching content structure
6. Test audio URL accessibility
```

**Expected Result:** Complete successful response in 5-8 seconds

### 2. Error Handling Testing

#### Invalid File Format

```
1. Upload .txt file instead of audio
2. Expect 400 error with INVALID_FILE_FORMAT code
3. Verify error message clarity for user display
```

#### Large File Testing

```
1. Upload file > 10MB
2. Expect 400 error with FILE_TOO_LARGE code
3. Check file size details in response
```

#### Network Timeout Testing

```
1. Set Postman timeout to 2 seconds
2. Upload audio file
3. Expect timeout error
4. Verify graceful error handling
```

### 3. Performance Testing

#### Response Time Validation

```
1. Upload audio file
2. Measure total response time
3. Fast Mode: Should be < 8 seconds
4. Optimized Mode: Should be < 12 seconds
```

#### Concurrent Request Testing

```
1. Use Postman Runner
2. Send 5 concurrent requests
3. Verify all succeed
4. Check for rate limiting
```

---

## 🔧 Frontend Integration Testing

### React Native HTTP Client Testing

#### Using Axios

```javascript
// Test this exact configuration in Postman first
const formData = new FormData();
formData.append('audio', {
  uri: audioFileUri,
  type: 'audio/wav',
  name: 'recording.wav',
});

const response = await axios.post('http://localhost:4000/api/checkin', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 30000,
});
```

#### Using Fetch API

```javascript
// Alternative approach to test
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.wav');

const response = await fetch('http://localhost:4000/api/checkin', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### Real Device Testing Checklist

1. **iOS Testing**
   - [ ] Test with iPhone microphone recordings
   - [ ] Verify audio format compatibility
   - [ ] Check network request permissions

2. **Android Testing**
   - [ ] Test with Android microphone recordings
   - [ ] Verify audio codec support
   - [ ] Check file URI handling

3. **Network Conditions**
   - [ ] Test on WiFi
   - [ ] Test on cellular data
   - [ ] Test with poor connection

---

## 📱 Mobile-Specific Considerations

### Audio File Handling

#### iOS Audio Recording

```javascript
// Test these file properties in Postman
Format: CAF or M4A (convert to WAV if needed)
Sample Rate: 44100 Hz
Channels: 1 (mono) or 2 (stereo)
Bit Depth: 16-bit
```

#### Android Audio Recording

```javascript
// Test these file properties in Postman
Format: 3GP or MP4 (convert to WAV if needed)
Sample Rate: 8000-48000 Hz
Channels: 1 (mono)
Encoding: AAC or AMR
```

### File Size Optimization

**Recommended Settings:**

- **Sample Rate:** 16000 Hz (sufficient for speech recognition)
- **Channels:** 1 (mono)
- **Bit Rate:** 64 kbps
- **Expected Size:** ~480 KB for 60-second recording

---

## 🔍 Debugging Common Issues

### 1. Upload Failures

**Problem:** File upload returns 400 error **Solutions:**

- Check file format (must be wav/mp3/m4a)
- Verify file size < 10MB
- Ensure Content-Type header is set correctly

### 2. Slow Response Times

**Problem:** API takes > 15 seconds to respond **Check:**

- Server logs for external API delays
- Network connectivity between services
- Database connection performance

### 3. Audio URL Issues

**Problem:** Generated audio URL is not accessible **Solutions:**

- Verify TTS service is working
- Check audio file storage permissions
- Confirm URL format and expiration

### 4. Sentiment Analysis Issues

**Problem:** Unexpected sentiment results **Debugging:**

- Check transcript accuracy first
- Verify audio quality and clarity
- Test with known sentiment phrases

---

## 📊 Performance Monitoring

### Key Metrics to Track

1. **Response Times**
   - Total API response time
   - Individual service times (STT, Sentiment, Coaching, TTS)
   - Network latency

2. **Success Rates**
   - Overall API success rate
   - Individual service success rates
   - Error type distribution

3. **Audio Quality**
   - Transcription accuracy
   - Sentiment confidence scores
   - Audio clarity metrics

### Postman Test Scripts

#### Response Time Validation

```javascript
pm.test('Response time is acceptable', function () {
  pm.expect(pm.response.responseTime).to.be.below(8000); // 8 seconds max
});
```

#### Required Fields Validation

```javascript
pm.test('Response has required fields', function () {
  const responseJson = pm.response.json();
  pm.expect(responseJson.success).to.be.true;
  pm.expect(responseJson.data.sessionId).to.exist;
  pm.expect(responseJson.data.transcript).to.exist;
  pm.expect(responseJson.data.sentiment.score).to.be.within(0, 1);
});
```

---

## 🚀 Recommended Testing Workflow

### Daily Development Testing

1. **Morning Health Check**

   ```
   1. Run /ping endpoint
   2. Run /api/health endpoint
   3. Verify all external services are responding
   ```

2. **Feature Testing**

   ```
   1. Test latest code changes with sample audio
   2. Verify response format hasn't changed
   3. Check performance remains within targets
   ```

3. **Integration Testing**
   ```
   1. Test with actual mobile app recordings
   2. Verify cross-platform compatibility
   3. Check error handling scenarios
   ```

### Pre-Release Testing

1. **Comprehensive Test Suite**
   - Run all Postman collection tests
   - Performance testing with realistic audio files
   - Error scenario validation

2. **Load Testing**
   - Use Postman Runner for concurrent requests
   - Monitor response times under load
   - Verify rate limiting behavior

3. **Mobile Device Testing**
   - Test on actual iOS/Android devices
   - Verify audio recording integration
   - Check network condition handling

---

**💡 Pro Tip:** Save successful test requests as examples in your Postman collection for consistent
testing and team collaboration.\*\*
