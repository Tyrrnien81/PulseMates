import { AssemblyAI } from 'assemblyai';
import { SentimentResult } from '../types';

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  processingTime: number;
}

export interface UnifiedResult {
  transcript: string;
  confidence: number;
  sentiment: SentimentResult;
  processingTime: number;
}

export class AssemblyAIService {
  private client: AssemblyAI;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second base delay

  constructor() {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ASSEMBLYAI_API_KEY is not configured in environment variables'
      );
    }

    this.client = new AssemblyAI({
      apiKey: apiKey,
    });
  }

  /**
   * Transcribe audio file with sentiment analysis in a single API call
   */
  async transcribeWithSentiment(audioFilePath: string): Promise<UnifiedResult> {
    const startTime = Date.now();

    try {
      console.log(`🎤 Starting AssemblyAI transcription for: ${audioFilePath}`);

      // Upload file and transcribe with sentiment analysis enabled
      const transcript = await this.executeWithRetry(async () => {
        return await this.client.transcripts.transcribe({
          audio: audioFilePath,
          sentiment_analysis: true,
          punctuate: true,
          format_text: true,
        });
      });

      console.log(
        `✅ AssemblyAI transcription completed: "${transcript.text?.substring(0, 50)}..."`
      );

      // Validate the response
      if (!transcript.text || transcript.text.trim().length === 0) {
        throw new Error('No transcription text received from AssemblyAI');
      }

      // Extract sentiment data
      const sentimentResult = this.extractSentimentData(transcript);

      const processingTime = Date.now() - startTime;

      return {
        transcript: transcript.text,
        confidence: transcript.confidence || 0.8, // Default confidence if not provided
        sentiment: sentimentResult,
        processingTime,
      };
    } catch (error) {
      console.error(`❌ AssemblyAI transcription failed:`, error);
      throw new Error(
        `AssemblyAI service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract and normalize sentiment data from AssemblyAI response
   */
  private extractSentimentData(transcript: unknown): SentimentResult {
    // AssemblyAI provides sentiment analysis per sentence
    // We'll calculate overall sentiment from all sentences
    const sentimentAnalysis = (
      transcript as { sentiment_analysis_results?: unknown[] }
    )?.sentiment_analysis_results;

    if (!sentimentAnalysis || sentimentAnalysis.length === 0) {
      // Default neutral sentiment if no sentiment data
      return {
        score: 0.5,
        label: 'neutral',
        confidence: 0.5,
      };
    }

    // Calculate weighted average sentiment
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;
    let totalConfidence = 0;

    sentimentAnalysis.forEach((sentence: unknown) => {
      const sentenceData = sentence as {
        sentiment?: string;
        confidence?: number;
      };
      const sentiment = sentenceData.sentiment;
      const confidence = sentenceData.confidence || 0;

      switch (sentiment) {
        case 'POSITIVE':
          totalPositive += confidence;
          break;
        case 'NEGATIVE':
          totalNegative += confidence;
          break;
        case 'NEUTRAL':
          totalNeutral += confidence;
          break;
      }
      totalConfidence += confidence;
    });

    // Normalize scores
    const avgConfidence = totalConfidence / sentimentAnalysis.length;
    const positiveRatio = totalPositive / totalConfidence;
    const negativeRatio = totalNegative / totalConfidence;
    const neutralRatio = totalNeutral / totalConfidence;

    // Determine overall sentiment label and score
    let label: 'positive' | 'negative' | 'neutral';
    let score: number;

    if (positiveRatio > negativeRatio && positiveRatio > neutralRatio) {
      label = 'positive';
      score = 0.5 + positiveRatio * 0.5; // 0.5-1.0 range for positive
    } else if (negativeRatio > positiveRatio && negativeRatio > neutralRatio) {
      label = 'negative';
      score = 0.5 - negativeRatio * 0.5; // 0.0-0.5 range for negative
    } else {
      label = 'neutral';
      score = 0.4 + neutralRatio * 0.2; // 0.4-0.6 range for neutral
    }

    return {
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      label,
      confidence: Math.round(avgConfidence * 100) / 100,
    };
  }

  /**
   * Execute function with exponential backoff retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
      console.warn(
        `⚠️ AssemblyAI API attempt ${attempt} failed, retrying in ${delay}ms...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  /**
   * Health check for AssemblyAI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple API test - check if we can access the API
      await this.client.transcripts.list({ limit: 1 });
      return true;
    } catch (error) {
      console.error('AssemblyAI health check failed:', error);
      return false;
    }
  }

  /**
   * Get service information
   */
  getServiceInfo(): { provider: string; features: string[]; version: string } {
    return {
      provider: 'AssemblyAI',
      features: [
        'transcription',
        'sentiment_analysis',
        'punctuation',
        'text_formatting',
      ],
      version: '4.14.0',
    };
  }
}
