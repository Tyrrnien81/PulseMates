import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadAudio, cleanupTempFile } from '../middleware/upload';

import { AssemblyAIService } from '../services/assemblyaiService';
import { DatabaseService } from '../services/databaseService';
import { CacheService } from '../services/cacheService';
import { OptimizedCoachingService } from '../services/optimizedCoachingService';
import { CheckinResponse, APIError } from '../types';

const router = express.Router();

// POST /api/checkin - Voice check-in endpoint
router.post('/', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  let uploadedFilePath: string | undefined;

  try {
    // Handle file upload with multer
    uploadAudio(req, res, async (uploadError): Promise<void> => {
      try {
        if (uploadError) {
          console.error('❌ File upload error:', uploadError.message);
          res.status(400).json({
            success: false,
            error: uploadError.message,
            timestamp: new Date().toISOString(),
          } as APIError);
          return;
        }

        // Check if file was uploaded
        if (!req.file) {
          res.status(400).json({
            success: false,
            error:
              'No audio file uploaded. Please include an audio file with key "audio".',
            timestamp: new Date().toISOString(),
          } as APIError);
          return;
        }

        uploadedFilePath = req.file.path;
        console.log(
          `📁 Audio file uploaded: ${uploadedFilePath} (${req.file.size} bytes)`
        );

        // Generate session ID for tracking
        const sessionId = uuidv4();
        console.log(`🔄 Processing check-in session: ${sessionId}`);

        // Step 1: Check cache first, then Speech-to-Text + Sentiment Analysis with fallback
        const cacheService = new CacheService();
        let unifiedResult =
          await cacheService.getCachedResult(uploadedFilePath);

        if (unifiedResult) {
          console.log(`💾 Using cached transcription result`);
        } else {
          try {
            console.log(
              '🎤 Starting AssemblyAI transcription with sentiment analysis...'
            );
            const assemblyaiService = new AssemblyAIService();
            unifiedResult =
              await assemblyaiService.transcribeWithSentiment(uploadedFilePath);

            // Cache the result for future requests
            await cacheService.setCachedResult(uploadedFilePath, unifiedResult);

            console.log(
              `✅ AssemblyAI processing completed: "${unifiedResult.transcript.substring(0, 50)}..."`
            );
          } catch (assemblyError) {
            console.error(
              `⚠️ AssemblyAI failed, falling back to mock services:`,
              assemblyError
            );

            // Fallback to mock services for demo continuity
            const { MockSTTService, MockSentimentService } = await import(
              '../services/mockServices'
            );

            const mockTranscription =
              await MockSTTService.transcribe(uploadedFilePath);
            const mockSentiment = await MockSentimentService.analyzeSentiment(
              mockTranscription.transcript
            );

            unifiedResult = {
              transcript: mockTranscription.transcript,
              confidence: mockTranscription.confidence,
              sentiment: mockSentiment,
              processingTime: mockTranscription.processingTime,
            };

            console.log(
              `🔄 Fallback processing completed: "${unifiedResult.transcript.substring(0, 50)}..."`
            );
          }
        }

        console.log(
          `✅ Sentiment analysis: ${unifiedResult.sentiment.label} (score: ${unifiedResult.sentiment.score})`
        );

        // Step 2: Database Logging (Real sentiment data)
        console.log('📊 Logging sentiment data to database...');
        const databaseService = new DatabaseService();
        await databaseService.logSentimentData(
          sessionId,
          unifiedResult.sentiment
        );
        console.log(`✅ Sentiment data logged for session: ${sessionId}`);

        // Step 3: AI Coaching Generation with TTS (Phase 5)
        console.log('🤖 Generating personalized coaching with TTS...');
        const optimizedCoachingService = new OptimizedCoachingService();

        // Multiple ways to select coaching mode for flexible testing:
        // 1. Query parameter: ?mode=fast or ?mode=optimized
        // 2. Request header: X-Coaching-Mode: fast or optimized
        // 3. Environment variable: COACHING_MODE (fallback)
        const queryMode = req.query.mode as 'fast' | 'optimized';
        const headerMode = req.headers['x-coaching-mode'] as
          | 'fast'
          | 'optimized';
        const envMode = process.env.COACHING_MODE as 'fast' | 'optimized';

        const coachingMode = queryMode || headerMode || envMode || 'fast';

        // Check TTS enablement via query parameter or environment
        const enableTTS =
          req.query.tts !== 'false' && process.env.ENABLE_TTS !== 'false';

        console.log(
          `🎛️ Using coaching mode: ${coachingMode} | TTS enabled: ${enableTTS} (source: ${
            queryMode
              ? 'query'
              : headerMode
                ? 'header'
                : envMode
                  ? 'env'
                  : 'default'
          })`
        );

        // Generate coaching with TTS integration (Phase 5)
        const coachingResult =
          await optimizedCoachingService.generateCoachingWithTTS(
            unifiedResult.sentiment,
            unifiedResult.transcript,
            sessionId,
            coachingMode,
            enableTTS
          );

        console.log(
          `✅ Coaching with TTS completed (${coachingMode} mode, TTS: ${enableTTS}): ${coachingResult.motivationalMessage.substring(0, 50)}...`
        );

        if (coachingResult.audioUrl) {
          console.log(
            `🔊 TTS audio generated: ${coachingResult.audioUrl} (${coachingResult.audioMetadata?.duration}s, ${(coachingResult.audioMetadata?.fileSize || 0) / 1024}KB)`
          );
        }

        // Calculate total processing time
        const processingTime = Date.now() - startTime;
        console.log(`⚡ Total processing time: ${processingTime}ms`);

        // Build successful response with TTS data (Phase 5)
        const responseData: CheckinResponse['data'] = {
          transcript: unifiedResult.transcript,
          sentiment: unifiedResult.sentiment,
          coaching: coachingResult,
          sessionId,
        };

        // Add TTS fields conditionally to avoid undefined assignment
        if (coachingResult.audioUrl) {
          responseData.audioUrl = coachingResult.audioUrl;
        }
        if (coachingResult.audioText) {
          responseData.audioText = coachingResult.audioText;
        }
        if (coachingResult.audioMetadata) {
          responseData.audioMetadata = coachingResult.audioMetadata;
        }

        const response: CheckinResponse = {
          success: true,
          data: responseData,
          processingTime,
        };

        // Cleanup uploaded file
        if (uploadedFilePath) {
          cleanupTempFile(uploadedFilePath);
        }

        res.status(200).json(response);
        console.log(
          `✅ Check-in completed successfully for session ${sessionId}`
        );
      } catch (processingError) {
        console.error('❌ Processing error:', processingError);

        // Cleanup uploaded file in case of error
        if (uploadedFilePath) {
          cleanupTempFile(uploadedFilePath);
        }

        res.status(500).json({
          success: false,
          error: 'Internal server error during audio processing',
          details:
            process.env.NODE_ENV === 'development'
              ? processingError
              : undefined,
          timestamp: new Date().toISOString(),
        } as APIError);
      }
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);

    // Cleanup uploaded file in case of error
    if (uploadedFilePath) {
      cleanupTempFile(uploadedFilePath);
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    } as APIError);
  }
});

export default router;
