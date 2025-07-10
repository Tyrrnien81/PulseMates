import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { uploadAudio, cleanupTempFile } from '../middleware/upload';
import {
  MockSTTService,
  MockSentimentService,
  MockCoachingService,
  MockTTSService,
} from '../services/mockServices';
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

        // Step 1: Speech-to-Text Processing
        console.log('🎤 Starting speech-to-text processing...');
        const transcriptionResult =
          await MockSTTService.transcribe(uploadedFilePath);
        console.log(
          `✅ Transcription completed: "${transcriptionResult.transcript}" (confidence: ${transcriptionResult.confidence})`
        );

        // Step 2: Sentiment Analysis
        console.log('🎭 Analyzing sentiment...');
        const sentimentResult = await MockSentimentService.analyzeSentiment(
          transcriptionResult.transcript
        );
        console.log(
          `✅ Sentiment analysis completed: ${sentimentResult.label} (score: ${sentimentResult.score})`
        );

        // Step 3: AI Coaching Generation
        console.log('🤖 Generating personalized coaching...');
        const coachingResult = await MockCoachingService.generateCoaching(
          sentimentResult,
          transcriptionResult.transcript
        );
        console.log(
          `✅ Coaching generated: ${coachingResult.motivationalMessage.substring(0, 50)}...`
        );

        // Step 4: Text-to-Speech for motivational message
        console.log('🔊 Converting coaching message to speech...');
        const ttsResult = await MockTTSService.generateSpeech(
          coachingResult.motivationalMessage
        );
        console.log(
          `✅ TTS audio generated: ${ttsResult.audioUrl} (${ttsResult.duration}s)`
        );

        // Calculate total processing time
        const processingTime = Date.now() - startTime;
        console.log(`⚡ Total processing time: ${processingTime}ms`);

        // Build successful response
        const response: CheckinResponse = {
          success: true,
          data: {
            transcript: transcriptionResult.transcript,
            sentiment: sentimentResult,
            coaching: coachingResult,
            audioUrl: ttsResult.audioUrl,
            sessionId,
          },
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
