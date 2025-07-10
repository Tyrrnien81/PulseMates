import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import * as fs from 'fs';
import * as path from 'path';

export interface TTSResult {
  audioUrl: string;
  audioFilePath: string;
  duration: number;
  fileSize: number;
  format: 'mp3';
  processingTime: number;
}

export interface VoiceConfig {
  languageCode: 'en-US';
  voiceName: string;
  ssmlGender: 'FEMALE';
}

export class GoogleTTSService {
  private client: TextToSpeechClient;
  private readonly baseAudioDir: string;
  private readonly voiceConfig: VoiceConfig;
  private sessionFiles: Map<string, string[]> = new Map(); // Track files per session

  constructor() {
    // Initialize Google Cloud TTS client with service account key
    this.client = new TextToSpeechClient({
      keyFilename: path.join(__dirname, '../../google-cloud-tts-key.json'),
    });

    // Set up audio storage directory
    this.baseAudioDir = path.join(__dirname, '../../uploads/audio');
    this.ensureAudioDirectory();

    // Configure female English voice (Phase 5 requirement)
    this.voiceConfig = {
      languageCode: 'en-US',
      voiceName: 'en-US-Standard-C', // Natural female voice
      ssmlGender: 'FEMALE',
    };

    console.log('🔊 GoogleTTSService initialized with female English voice');
  }

  /**
   * Generate speech from text with session-based file management
   */
  async generateSpeech(text: string, sessionId: string): Promise<TTSResult> {
    const startTime = Date.now();

    try {
      console.log(`🎙️ Generating TTS for session: ${sessionId}`);
      console.log(`📝 Text length: ${text.length} characters`);

      // Prepare TTS request with female English voice
      const request = {
        input: { text },
        voice: {
          languageCode: this.voiceConfig.languageCode,
          name: this.voiceConfig.voiceName,
          ssmlGender: this.voiceConfig.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0,
        },
      };

      // Call Google Cloud TTS API
      console.log(`🌐 Calling Google Cloud TTS API...`);
      const [response] = await this.client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from Google Cloud TTS');
      }

      // Generate unique filename for this session
      const audioFileName = `tts_${sessionId}_${Date.now()}.mp3`;
      const audioFilePath = path.join(this.baseAudioDir, audioFileName);

      // Write audio file to disk
      await fs.promises.writeFile(
        audioFilePath,
        response.audioContent,
        'binary'
      );

      // Track file for session cleanup
      this.trackSessionFile(sessionId, audioFilePath);

      // Get file stats
      const stats = await fs.promises.stat(audioFilePath);
      const fileSize = stats.size;

      // Estimate duration (rough calculation: ~125 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = Math.max(1, Math.ceil((wordCount / 125) * 60));

      // Generate audio URL
      const audioUrl = `/audio/${audioFileName}`;

      const processingTime = Date.now() - startTime;

      console.log(`✅ TTS generated successfully:`);
      console.log(`   📁 File: ${audioFileName}`);
      console.log(`   📏 Size: ${(fileSize / 1024).toFixed(1)} KB`);
      console.log(`   ⏱️ Duration: ~${estimatedDuration}s`);
      console.log(`   🚀 Processing time: ${processingTime}ms`);

      return {
        audioUrl,
        audioFilePath,
        duration: estimatedDuration,
        fileSize,
        format: 'mp3',
        processingTime,
      };
    } catch (error) {
      console.error(`❌ Google Cloud TTS failed:`, error);
      throw new Error(
        `TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clean up audio files for a specific session
   */
  async cleanupSessionFiles(sessionId: string): Promise<number> {
    const sessionFilePaths = this.sessionFiles.get(sessionId) || [];
    let cleanedCount = 0;

    for (const filePath of sessionFilePaths) {
      try {
        if (await this.fileExists(filePath)) {
          await fs.promises.unlink(filePath);
          cleanedCount++;
          console.log(`🗑️ Deleted audio file: ${path.basename(filePath)}`);
        }
      } catch (error) {
        console.error(`⚠️ Failed to delete file ${filePath}:`, error);
      }
    }

    // Remove session tracking
    this.sessionFiles.delete(sessionId);

    if (cleanedCount > 0) {
      console.log(
        `🧹 Cleaned up ${cleanedCount} audio files for session: ${sessionId}`
      );
    }

    return cleanedCount;
  }

  /**
   * Schedule automatic cleanup for a session (1 hour default)
   */
  scheduleSessionCleanup(
    sessionId: string,
    delayMs: number = 60 * 60 * 1000
  ): void {
    setTimeout(async () => {
      try {
        await this.cleanupSessionFiles(sessionId);
      } catch (error) {
        console.error(
          `⚠️ Scheduled cleanup failed for session ${sessionId}:`,
          error
        );
      }
    }, delayMs);

    console.log(
      `⏰ Scheduled cleanup for session ${sessionId} in ${delayMs / 1000}s`
    );
  }

  /**
   * Clean up all expired audio files
   */
  async cleanupExpiredFiles(
    maxAgeMs: number = 60 * 60 * 1000
  ): Promise<number> {
    try {
      const files = await fs.promises.readdir(this.baseAudioDir);
      const now = Date.now();
      let cleanedCount = 0;

      for (const file of files) {
        if (!file.startsWith('tts_') || !file.endsWith('.mp3')) continue;

        const filePath = path.join(this.baseAudioDir, file);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.birthtimeMs > maxAgeMs) {
          await fs.promises.unlink(filePath);
          cleanedCount++;
          console.log(`🗑️ Deleted expired audio file: ${file}`);
        }
      }

      if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} expired audio files`);
      }

      return cleanedCount;
    } catch (error) {
      console.error(`❌ Failed to cleanup expired files:`, error);
      return 0;
    }
  }

  /**
   * Get TTS service statistics
   */
  getServiceInfo(): {
    provider: string;
    voiceConfig: VoiceConfig;
    audioFormat: string;
    activeSessions: number;
    totalTrackedFiles: number;
  } {
    const totalTrackedFiles = Array.from(this.sessionFiles.values()).reduce(
      (total, files) => total + files.length,
      0
    );

    return {
      provider: 'Google Cloud Text-to-Speech',
      voiceConfig: this.voiceConfig,
      audioFormat: 'MP3',
      activeSessions: this.sessionFiles.size,
      totalTrackedFiles,
    };
  }

  /**
   * Private helper methods
   */
  private ensureAudioDirectory(): void {
    if (!fs.existsSync(this.baseAudioDir)) {
      fs.mkdirSync(this.baseAudioDir, { recursive: true });
      console.log(`📁 Created audio directory: ${this.baseAudioDir}`);
    }
  }

  private trackSessionFile(sessionId: string, filePath: string): void {
    if (!this.sessionFiles.has(sessionId)) {
      this.sessionFiles.set(sessionId, []);
    }
    this.sessionFiles.get(sessionId)!.push(filePath);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
