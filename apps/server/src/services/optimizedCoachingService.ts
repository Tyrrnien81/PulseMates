import OpenAI from 'openai';
import { SentimentResult, CoachingResponse } from '../types';

export class OptimizedCoachingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Cached coaching messages (ultra-fast response)
  private static readonly CACHED_COACHING = {
    negative: {
      breathingExercise: {
        title: '5-Minute Stress Relief Breathing',
        instructions: [
          'Sit comfortably and close your eyes',
          'Breathe in slowly for 4 seconds',
          'Hold your breath for 7 seconds',
          'Exhale slowly for 8 seconds',
          'Repeat 4 times',
        ],
        duration: 5,
      },
      motivationalMessage:
        "It's tough right now, but you're doing well enough. Taking it one step at a time, everything will be okay.",
      stretchExercise: {
        title: 'Tension Relief Stretches',
        instructions: [
          'Slowly roll your neck and shoulders',
          'Stretch your arms up and down',
          'Take deep breaths and release tension',
        ],
      },
      resources: [
        {
          title: 'University Counseling Center',
          description: 'Professional counseling services',
          url: 'https://counseling.university.edu',
          category: 'counseling' as const,
        },
      ],
    },
    neutral: {
      breathingExercise: {
        title: 'Daily Management Breathing',
        instructions: [
          'Sit in a comfortable position',
          'Breathe in naturally',
          'Pause briefly and release tension',
          'Exhale slowly',
          'Repeat for 3 minutes',
        ],
        duration: 3,
      },
      motivationalMessage:
        'Cherish this moment. Your efforts will create good results.',
      stretchExercise: {
        title: 'Energy Recharge Stretches',
        instructions: [
          'Turn your neck left and right',
          'Raise and lower your shoulders',
          'Stretch your arms to relax your body',
        ],
      },
      resources: [
        {
          title: 'Mindfulness Meditation',
          description: 'Daily stress management',
          url: 'https://meditation.com',
          category: 'meditation' as const,
        },
      ],
    },
    positive: {
      breathingExercise: {
        title: 'Energy Maintenance Breathing',
        instructions: [
          'Take a deep breath',
          'Feel the positive energy',
          'Exhale slowly',
          'Maintain this good feeling',
          'Repeat for 2 minutes',
        ],
        duration: 2,
      },
      motivationalMessage:
        "You're doing really well! Keep maintaining this positive energy.",
      stretchExercise: {
        title: 'Vitality Boost Stretches',
        instructions: [
          'Stretch your arms high up',
          'Lean your body left and right',
          'Feel the positive energy throughout your body',
        ],
      },
      resources: [
        {
          title: 'Achievement Maintenance Tips',
          description: 'Ways to sustain positive state',
          url: 'https://wellness.com',
          category: 'meditation' as const,
        },
      ],
    },
  };

  /**
   * Ultra-fast cache-based coaching generation (0ms)
   * Recommended for demo use
   */
  async generateFastCoaching(
    sentiment: SentimentResult
  ): Promise<CoachingResponse> {
    const { label } = sentiment;

    // Use cached response (instant return)
    const cachedCoaching =
      OptimizedCoachingService.CACHED_COACHING[label] ||
      OptimizedCoachingService.CACHED_COACHING.neutral;

    return {
      ...cachedCoaching,
      stretchExercise: {
        title: 'Simple Neck and Shoulder Stretches',
        instructions: [
          'Slowly turn your neck left and right',
          'Move your shoulders up and down',
          'Stretch your arms left and right',
          'Repeat 3 times for 10 seconds each',
        ],
      },
    };
  }

  /**
   * GPT-4o-mini optimized coaching generation (~1.5s)
   * Recommended for production - personalized responses
   */
  async generateOptimizedCoaching(
    sentiment: SentimentResult,
    transcript: string
  ): Promise<CoachingResponse> {
    const { score, label } = sentiment;

    // Short and efficient prompt
    const prompt = `Sentiment: ${label} (${score.toFixed(2)})
Text: "${transcript.substring(0, 100)}..."

Return JSON only:
{
  "motivationalMessage": "English encouragement message (1 sentence)",
  "breathingTip": "breathing method (1 line)",
  "stretchTip": "stretching (1 line)"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Much faster model
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for faster response
        max_tokens: 200, // Token limit
      });

      const response = JSON.parse(
        completion.choices[0].message.content || '{}'
      );

      // Combine with cached structure
      const baseCoaching =
        OptimizedCoachingService.CACHED_COACHING[label] ||
        OptimizedCoachingService.CACHED_COACHING.neutral;

      return {
        ...baseCoaching,
        motivationalMessage:
          response.motivationalMessage || baseCoaching.motivationalMessage,
      };
    } catch (error) {
      console.log(`⚠️ AI coaching failed, using cache: ${error}`);
      return this.generateFastCoaching(sentiment);
    }
  }

  /**
   * Main coaching generation method (compatibility maintained)
   * Choose fast approach based on environment
   */
  async generateCoaching(
    sentiment: SentimentResult,
    transcript: string,
    mode: 'fast' | 'optimized' = 'fast'
  ): Promise<CoachingResponse> {
    if (mode === 'fast') {
      return this.generateFastCoaching(sentiment);
    } else {
      return this.generateOptimizedCoaching(sentiment, transcript);
    }
  }

  /**
   * Performance testing method
   */
  async performanceTest(sentiment: SentimentResult, transcript: string) {
    console.log('🔄 Starting coaching performance test...');

    // Cache-based test
    const fastStart = Date.now();
    const fastResult = await this.generateFastCoaching(sentiment);
    const fastEnd = Date.now();

    // Optimized AI test
    const optimizedStart = Date.now();
    const optimizedResult = await this.generateOptimizedCoaching(
      sentiment,
      transcript
    );
    const optimizedEnd = Date.now();

    console.log('📊 Performance comparison results:');
    console.log(`   📦 Cache-based: ${fastEnd - fastStart}ms`);
    console.log(`   🤖 Optimized AI: ${optimizedEnd - optimizedStart}ms`);

    return {
      fast: {
        time: fastEnd - fastStart,
        result: fastResult,
      },
      optimized: {
        time: optimizedEnd - optimizedStart,
        result: optimizedResult,
      },
    };
  }
}
