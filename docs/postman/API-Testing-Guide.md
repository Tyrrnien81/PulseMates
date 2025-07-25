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
**Expected Response Time:**

- **No TTS:** 4.6s (fast mode), 7-9s (optimized mode)
- **With TTS:** 5.8s (fast mode), 8-12s (optimized mode)

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

### 🎛️ API Control Parameters

#### Coaching Mode Control (3 Options)

**Option 1: Query Parameter (Recommended for Testing)**

```
{{BASE_URL}}/api/checkin?mode=fast        # 0ms coaching (demo)
{{BASE_URL}}/api/checkin?mode=optimized   # 1.5s coaching (production)
```

#### TTS (Text-to-Speech) Control ✨ NEW in Phase 5

**TTS Query Parameter:**

```
{{BASE_URL}}/api/checkin?tts=true         # Generate audio coaching
{{BASE_URL}}/api/checkin?tts=false        # Text-only coaching (default)
```

**Combined Parameters:**

```
{{BASE_URL}}/api/checkin?mode=fast&tts=true      # Fast coaching + audio
{{BASE_URL}}/api/checkin?mode=optimized&tts=true # Personalized coaching + audio
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

| Mode        | Speed | Use Case                 | Response Time (No TTS) | Response Time (With TTS) |
| ----------- | ----- | ------------------------ | ---------------------- | ------------------------ |
| `fast`      | 0ms   | Demos, High-throughput   | 4.6 seconds            | 5.8 seconds              |
| `optimized` | ~1.5s | Production, Personalized | 7-9 seconds            | 8-12 seconds             |

**TTS Comparison:**

| TTS Setting | Audio Output  | Added Processing Time | File Format | Voice          |
| ----------- | ------------- | --------------------- | ----------- | -------------- |
| `tts=false` | No audio      | 0ms                   | N/A         | N/A            |
| `tts=true`  | MP3 audio URL | ~730ms                | MP3         | Female English |

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
    // TTS fields (included when ?tts=true) ✨ NEW in Phase 5
    "audioUrl": "/audio/tts_sessionId_timestamp.mp3",     // URL to audio file (optional)
    "audioText": "Text content converted to speech",      // TTS source text (optional)
    "audioMetadata": {                                    // Audio details (optional)
      "duration": 14,                                     // Audio duration in seconds
      "fileSize": 83328,                                  // File size in bytes
      "format": "mp3",                                    // Audio format
      "processingTime": 730                               // TTS generation time in ms
    }
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

## 🚨 Phase 4: Crisis Detection & Enhanced Features Testing

### Crisis Detection Testing Scenarios

**Test the automatic crisis detection system for severe negative emotions:**

#### 1. Crisis Situation Test (Score < 0.2)

**Test Audio Content:**

```
"I feel hopeless and like nothing matters anymore. I can't handle this stress and I don't know what to do."
```

**Expected Response:**

```json
{
  "data": {
    "sentiment": {
      "score": 0.1,
      "label": "negative",
      "confidence": 0.9
    },
    "coaching": {
      "motivationalMessage": "Your feelings are valid and important. You don't have to face this alone...",
      "resources": [
        {
          "title": "Student Affairs – Get Help Now",
          "category": "emergency"
        }
      ]
    }
  }
}
---

## 🔊 Phase 5: TTS (Text-to-Speech) Testing ✨ NEW

### TTS Feature Testing Scenarios

**Test the new audio coaching generation system:**

#### 1. Basic TTS Test

**Request:**
```

POST {{BASE_URL}}/api/checkin?tts=true&mode=fast Body: form-data with audio file

````

**Expected TTS Fields in Response:**
```json
{
  "data": {
    "audioUrl": "/audio/tts_sessionId_timestamp.mp3",
    "audioText": "It's wonderful to hear that you're feeling positive!...",
    "audioMetadata": {
      "duration": 14,
      "fileSize": 83328,
      "format": "mp3",
      "processingTime": 730
    }
  }
}
````

#### 2. TTS Audio File Validation

**Test Steps:**

1. Send request with `?tts=true`
2. Extract `audioUrl` from response
3. Make GET request to audio URL
4. Verify MP3 file downloads successfully
5. Check audio file properties:
   - Format: MP3
   - Duration: Matches `audioMetadata.duration`
   - Size: Matches `audioMetadata.fileSize`

#### 3. TTS vs Non-TTS Comparison

**Test Both Modes:**

```bash
# Non-TTS request
{{BASE_URL}}/api/checkin?tts=false

# TTS request
{{BASE_URL}}/api/checkin?tts=true
```

**Validation:**

- Non-TTS: No audio fields in response
- TTS: All audio fields present
- Processing time difference: ~730ms additional for TTS

#### 4. TTS Voice Quality Test

**Postman Test Script:**

```javascript
pm.test('TTS audio metadata is valid', function () {
  const responseJson = pm.response.json();
  const audio = responseJson.data.audioMetadata;

  if (audio) {
    pm.expect(audio.format).to.equal('mp3');
    pm.expect(audio.duration).to.be.above(0);
    pm.expect(audio.fileSize).to.be.above(0);
    pm.expect(audio.processingTime).to.be.below(2000); // Under 2 seconds
  }
});
```

#### 5. TTS Error Handling Test

**Simulate TTS Failure:**

- Service should gracefully fallback to text-only response
- No audio fields should be present
- Main response should still succeed

### TTS Performance Testing

#### 1. Processing Time Validation

```javascript
pm.test('TTS processing time is acceptable', function () {
  const responseJson = pm.response.json();
  const processingTime = responseJson.processingTime;

  // With TTS should be under 10 seconds
  pm.expect(processingTime).to.be.below(10000);
});
```

#### 2. Audio File Accessibility Test

```javascript
pm.test('Audio URL is accessible', function () {
  const responseJson = pm.response.json();
  const audioUrl = responseJson.data.audioUrl;

  if (audioUrl) {
    pm.sendRequest(
      {
        url: pm.variables.get('BASE_URL') + audioUrl,
        method: 'HEAD',
      },
      function (err, response) {
        pm.expect(response.code).to.equal(200);
        pm.expect(response.headers.get('content-type')).to.include('audio/mp3');
      }
    );
  }
});
```

### TTS Integration Test Checklist

- [ ] **Basic TTS Generation**
  - [ ] `?tts=true` generates audio fields
  - [ ] `?tts=false` omits audio fields
  - [ ] Audio URL is valid and accessible
- [ ] **Audio Quality**
  - [ ] MP3 format
  - [ ] Female English voice
  - [ ] Clear pronunciation
  - [ ] Appropriate speaking pace
- [ ] **Performance**
  - [ ] TTS generation under 2 seconds
  - [ ] Total response time under 10 seconds
  - [ ] File size reasonable for duration
- [ ] **Error Handling**
  - [ ] Graceful fallback when TTS fails
  - [ ] No audio fields when disabled
  - [ ] Main response still succeeds
- [ ] **File Management**
  - [ ] Audio files accessible immediately after generation
  - [ ] Files expire after 1 hour (test separately)
  - [ ] Cleanup system working (server logs) } }

```

#### 2. Moderate Negative Test (Score 0.2-0.4)

**Test Audio Content:**

```

"I'm feeling stressed about my exams and having trouble sleeping."

```

**Expected Response:**

- Sentiment score: 0.2-0.4
- Resources: Mix of counseling and meditation
- No emergency resources prioritized

#### 3. Neutral State Test (Score 0.4-0.6)

**Test Audio Content:**

```

"Today was okay, nothing special happened but I feel alright."

```

**Expected Response:**

- Sentiment score: 0.4-0.6
- Resources: Mindfulness and preventive counseling
- Proactive wellness focus

#### 4. Positive State Test (Score > 0.6)

**Test Audio Content:**

```

"I had a great day today! Finished my project and feeling accomplished."

````

**Expected Response:**

- Sentiment score: > 0.6
- Resources: Wellness maintenance and growth
- Positive reinforcement messaging

### University Resources Verification

**Validate that all 9 UW-Madison resources are properly integrated:**

#### Resource Categories to Verify

**1. Counseling Services (3 resources):**

```json
[
  {
    "title": "UHS Mental Health Services",
    "url": "https://www.uhs.wisc.edu/mental-health/",
    "category": "counseling"
  },
  {
    "title": "UHS Individual Counseling",
    "url": "https://www.uhs.wisc.edu/mental-health/individual/",
    "category": "counseling"
  },
  {
    "title": "Counseling Psychology Training Clinic",
    "url": "https://counselingpsych.education.wisc.edu/cp/outreach-clinic/training-clinic/about-cptc",
    "category": "counseling"
  }
]
````

**2. Meditation Resources (3 resources):**

```json
[
  {
    "title": "UW Mindfulness & Meditation Classes",
    "url": "https://recwell.wisc.edu/mindfulness/",
    "category": "meditation"
  },
  {
    "title": "Center for Healthy Minds – Mindfulness Resources",
    "url": "https://cultivatingjustice.chm.wisc.edu/resources/",
    "category": "meditation"
  },
  {
    "title": "UW Health Mindfulness Program",
    "url": "https://www.fammed.wisc.edu/aware-medicine/mindfulness/resources/",
    "category": "meditation"
  }
]
```

**3. Emergency Resources (3 resources):**

```json
[
  {
    "title": "Student Affairs – Get Help Now",
    "url": "https://students.wisc.edu/guides/get-help-now/",
    "category": "emergency"
  },
  {
    "title": "UW–Madison Emergency Procedures",
    "url": "https://ehs.wisc.edu/emergencies/",
    "category": "emergency"
  },
  {
    "title": "Emergency Management – UW Police",
    "url": "https://uwpd.wisc.edu/services/emergency-management/",
    "category": "emergency"
  }
]
```

### Resource Selection Validation Tests

#### Crisis Response Test Script

```javascript
// Postman Test Script for Crisis Detection
pm.test('Crisis detection works correctly', function () {
  const responseJson = pm.response.json();
  const sentiment = responseJson.data.sentiment;
  const resources = responseJson.data.coaching.resources;

  if (sentiment.score < 0.2 && sentiment.label === 'negative') {
    // Verify emergency resources are included
    const emergencyResources = resources.filter(r => r.category === 'emergency');
    pm.expect(emergencyResources.length).to.be.at.least(1);

    // Verify "Get Help Now" is prioritized first
    pm.expect(resources[0].title).to.include('Get Help Now');

    // Verify crisis messaging
    const message = responseJson.data.coaching.motivationalMessage;
    pm.expect(message).to.include("You don't have to face this alone");
  }
});
```

#### Resource Category Test Script

```javascript
// Validate all resources have proper categories
pm.test('All resources have valid categories', function () {
  const responseJson = pm.response.json();
  const resources = responseJson.data.coaching.resources;
  const validCategories = ['counseling', 'meditation', 'emergency'];

  resources.forEach(resource => {
    pm.expect(validCategories).to.include(resource.category);
    pm.expect(resource.url).to.match(/^https?:\/\//); // Valid URL
    pm.expect(resource.title).to.not.be.empty;
    pm.expect(resource.description).to.not.be.empty;
  });
});
```

### Enhanced Coaching Content Testing

#### Professional Messaging Validation

```javascript
// Test for appropriate messaging tone
pm.test('Professional coaching messaging', function () {
  const responseJson = pm.response.json();
  const message = responseJson.data.coaching.motivationalMessage;
  const sentiment = responseJson.data.sentiment;

  // Crisis messaging should be supportive and professional
  if (sentiment.score < 0.2) {
    pm.expect(message).to.include('feelings are valid');
    pm.expect(message).to.not.include('just think positive'); // Avoid dismissive language
  }

  // All messages should be encouraging without being dismissive
  pm.expect(message).to.not.include('snap out of it');
  pm.expect(message).to.not.include('just get over it');
});
```

#### Breathing Exercise Enhancement Test

```javascript
// Validate enhanced breathing exercises
pm.test('Enhanced breathing exercises', function () {
  const responseJson = pm.response.json();
  const breathingExercise = responseJson.data.coaching.breathingExercise;

  // Check for professional exercise titles
  const professionalTitles = [
    '4-7-8 Stress Relief Breathing',
    'Mindful Daily Breathing',
    'Energy Enhancement Breathing',
  ];

  pm.expect(professionalTitles).to.include(breathingExercise.title);
  pm.expect(breathingExercise.instructions.length).to.be.at.least(4);
  pm.expect(breathingExercise.duration).to.be.within(2, 6); // 2-6 minutes
});
```

### Performance Testing with Crisis Detection

#### Crisis Response Time Test

```javascript
// Verify crisis situations get immediate response
pm.test('Crisis situations get fast response', function () {
  const responseJson = pm.response.json();
  const sentiment = responseJson.data.sentiment;

  if (sentiment.score < 0.2 && sentiment.label === 'negative') {
    // Crisis should use fast mode (coaching should be near-instant)
    pm.expect(pm.response.responseTime).to.be.below(6000); // 6 seconds max

    // Should prioritize speed over personalization in crisis
    pm.expect(responseJson.data.coaching.motivationalMessage).to.exist;
  }
});
```

### Frontend Integration Testing for Phase 4

#### Crisis UI Handling Test

```javascript
// Example frontend integration for crisis detection
const handleCrisisResponse = response => {
  const { sentiment, coaching } = response.data;

  // Check for crisis situation
  if (sentiment.score < 0.2 && sentiment.label === 'negative') {
    // Show emergency alert UI
    showEmergencyAlert();

    // Filter and prioritize emergency resources
    const emergencyResources = coaching.resources.filter(r => r.category === 'emergency');
    displayEmergencyResources(emergencyResources);

    // Apply crisis-specific styling
    applyEmergencyTheme();

    // Log crisis detection for support team
    logCrisisDetection(response.data.sessionId);
  }
};
```

### Pre-Production Testing Checklist

**Phase 4 Specific Validations:**

- [ ] Crisis detection accuracy (score < 0.2 triggers emergency resources)
- [ ] All 9 UW-Madison resources are active and accessible
- [ ] Emergency resources appear first in crisis situations
- [ ] Professional messaging tone in all emotional states
- [ ] Enhanced breathing/stretch exercises are therapeutic
- [ ] Resource categorization is correct (counseling/meditation/emergency)
- [ ] Crisis response time is optimized (fast mode auto-selected)
- [ ] No dismissive language in any coaching messages
- [ ] All resource URLs are valid and accessible
- [ ] Crisis messaging includes professional support guidance

---

**💡 Pro Tip:** Save successful test requests as examples in your Postman collection for consistent
testing and team collaboration. Test crisis scenarios regularly to ensure the safety system works
reliably.\*\*
