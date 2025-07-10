import OpenAI from 'openai';
import { SentimentResult, CoachingResponse } from '../types';

export class OptimizedCoachingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // University of Wisconsin-Madison Mental Health Resources
  private static readonly UNIVERSITY_RESOURCES = {
    counseling: [
      {
        title: 'UHS Mental Health Services',
        description:
          'Provides free and confidential mental health services for students, including individual, group, and couples counseling, crisis support, and mental health management.',
        url: 'https://www.uhs.wisc.edu/mental-health/',
        category: 'counseling' as const,
      },
      {
        title: 'UHS Individual Counseling',
        description:
          'Offers short-term and ongoing confidential counseling for a wide range of concerns including emotional, interpersonal, and academic issues.',
        url: 'https://www.uhs.wisc.edu/mental-health/individual/',
        category: 'counseling' as const,
      },
      {
        title: 'Counseling Psychology Training Clinic',
        description:
          'Located in the Department of Educational Psychology, this clinic provides low-cost individual, couples, family, and group counseling to students and the community.',
        url: 'https://counselingpsych.education.wisc.edu/cp/outreach-clinic/training-clinic/about-cptc',
        category: 'counseling' as const,
      },
    ],
    meditation: [
      {
        title: 'UW Mindfulness & Meditation Classes',
        description:
          'Offers mindfulness and meditation classes at the Nicholas Recreation Center and Bakke Recreation & Wellbeing Center, including guided meditation and relaxation sessions.',
        url: 'https://recwell.wisc.edu/mindfulness/',
        category: 'meditation' as const,
      },
      {
        title: 'Center for Healthy Minds – Mindfulness Resources',
        description:
          'Provides free guided meditations, mindfulness audio resources, and recommended apps such as Healthy Minds Program and Insight Timer.',
        url: 'https://cultivatingjustice.chm.wisc.edu/resources/',
        category: 'meditation' as const,
      },
      {
        title: 'UW Health Mindfulness Program',
        description:
          'Offers mindfulness and meditation programs through the UW Integrative Health Clinic, with online resources and guided practices.',
        url: 'https://www.fammed.wisc.edu/aware-medicine/mindfulness/resources/',
        category: 'meditation' as const,
      },
    ],
    emergency: [
      {
        title: 'Student Affairs – Get Help Now',
        description:
          'Quick access page for immediate help in emergencies, including medical, mental health, or safety crises. Directs to 911 and campus resources.',
        url: 'https://students.wisc.edu/guides/get-help-now/',
        category: 'emergency' as const,
      },
      {
        title: 'UW–Madison Emergency Procedures',
        description:
          'Guides students and staff on what to do in any emergency, including when to call 911 and campus-specific emergency protocols.',
        url: 'https://ehs.wisc.edu/emergencies/',
        category: 'emergency' as const,
      },
      {
        title: 'Emergency Management – UW Police',
        description:
          'Provides information and training on campus emergency preparedness, crisis response, CPR/AED, and active threat response.',
        url: 'https://uwpd.wisc.edu/services/emergency-management/',
        category: 'emergency' as const,
      },
    ],
  };

  /**
   * Intelligent resource selection based on sentiment and crisis detection
   */
  private selectAppropriateResources(
    sentiment: SentimentResult
  ): CoachingResponse['resources'] {
    const { score, label } = sentiment;

    // Crisis detection: Very low sentiment score indicates potential emergency
    const isCrisisSituation = score < 0.2 && label === 'negative';

    if (isCrisisSituation) {
      // Emergency situation: Provide immediate crisis resources
      return [
        OptimizedCoachingService.UNIVERSITY_RESOURCES.emergency[0], // Get Help Now - priority
        OptimizedCoachingService.UNIVERSITY_RESOURCES.counseling[0], // UHS Mental Health Services
        OptimizedCoachingService.UNIVERSITY_RESOURCES.emergency[1], // Emergency Procedures
      ];
    }

    switch (label) {
      case 'negative':
        // Moderate negative: counseling + meditation support
        return [
          OptimizedCoachingService.UNIVERSITY_RESOURCES.counseling[0], // UHS Mental Health Services
          OptimizedCoachingService.UNIVERSITY_RESOURCES.counseling[1], // Individual Counseling
          OptimizedCoachingService.UNIVERSITY_RESOURCES.meditation[0], // Mindfulness Classes
        ];

      case 'neutral':
        // Neutral: proactive mental health maintenance
        return [
          OptimizedCoachingService.UNIVERSITY_RESOURCES.meditation[0], // Mindfulness Classes
          OptimizedCoachingService.UNIVERSITY_RESOURCES.meditation[1], // Center for Healthy Minds
          OptimizedCoachingService.UNIVERSITY_RESOURCES.counseling[2], // Training Clinic (preventive)
        ];

      case 'positive':
        // Positive: maintain wellbeing and growth
        return [
          OptimizedCoachingService.UNIVERSITY_RESOURCES.meditation[1], // Center for Healthy Minds
          OptimizedCoachingService.UNIVERSITY_RESOURCES.meditation[2], // UW Health Mindfulness
          OptimizedCoachingService.UNIVERSITY_RESOURCES.meditation[0], // Mindfulness Classes
        ];

      default:
        // Fallback to counseling resources
        return OptimizedCoachingService.UNIVERSITY_RESOURCES.counseling;
    }
  }

  /**
   * Crisis-aware motivational message generation
   */
  private generateMotivationalMessage(
    sentiment: SentimentResult,
    isCrisis: boolean = false
  ): string {
    const { score, label } = sentiment;

    if (isCrisis) {
      return "Your feelings are valid and important. You don't have to face this alone. Please reach out to the emergency resources listed below or call 911 if you're in immediate danger. Professional support is available 24/7 to help you through this difficult time.";
    }

    switch (label) {
      case 'negative':
        if (score < 0.3) {
          return "I hear that you're going through a tough time right now. These feelings are temporary, and seeking support is a sign of strength. The counseling resources below can provide professional guidance tailored to your needs.";
        } else {
          return "It's completely normal to have challenging moments. Remember that you have the resilience to work through this, and support is always available when you need it.";
        }

      case 'neutral':
        return 'Thank you for taking time to check in with yourself. This self-awareness is an important step in maintaining your mental wellbeing. The mindfulness resources below can help you build emotional resilience.';

      case 'positive':
        return "It's wonderful to hear that you're feeling positive! Continue nurturing this wellbeing through the mindfulness practices below, which can help you maintain and build upon these good feelings.";

      default:
        return 'Taking time for self-care and reflection is always valuable. The resources below can support your continued growth and wellbeing.';
    }
  }

  // Enhanced cached coaching responses with university resources
  private static readonly CACHED_COACHING = {
    negative: {
      breathingExercise: {
        title: '4-7-8 Stress Relief Breathing',
        instructions: [
          'Find a quiet, comfortable position',
          'Inhale through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale completely through your mouth for 8 counts',
          'Repeat this cycle 4 times',
          'Focus on the calming rhythm',
        ],
        duration: 5,
      },
      stretchExercise: {
        title: 'Tension Relief Stretches',
        instructions: [
          'Sit up straight and drop your shoulders',
          'Gently tilt your head to each side (hold 15 seconds)',
          'Roll your shoulders backward 5 times',
          'Stretch your arms across your chest and hold',
          'Take deep breaths throughout each stretch',
        ],
      },
      // Resources will be dynamically selected based on crisis detection
      resources: [], // Will be populated by selectAppropriateResources()
      motivationalMessage: '', // Will be generated by generateMotivationalMessage()
    },
    neutral: {
      breathingExercise: {
        title: 'Mindful Daily Breathing',
        instructions: [
          'Sit comfortably with your back straight',
          'Close your eyes or soften your gaze',
          'Breathe naturally without forcing',
          'Notice the sensation of each breath',
          'When your mind wanders, gently return focus to breathing',
          'Continue for 3-5 minutes',
        ],
        duration: 4,
      },
      stretchExercise: {
        title: 'Energizing Workplace Stretches',
        instructions: [
          'Stand up and stretch your arms overhead',
          'Gently twist your torso left and right',
          'Do 10 neck rolls in each direction',
          'Stretch your wrists and ankles',
          'Take 3 deep breaths to center yourself',
        ],
      },
      resources: [], // Will be populated dynamically
      motivationalMessage: '', // Will be generated dynamically
    },
    positive: {
      breathingExercise: {
        title: 'Energy Enhancement Breathing',
        instructions: [
          'Stand tall with your feet hip-width apart',
          'Inhale deeply while raising your arms up',
          'Hold for 3 seconds and feel the positive energy',
          'Exhale slowly while lowering your arms',
          'Smile and repeat 5 times',
          'Carry this energy forward',
        ],
        duration: 3,
      },
      stretchExercise: {
        title: 'Vitality Flow Stretches',
        instructions: [
          'Stand and reach your arms up high',
          'Side bend gently to the left and right',
          'Do gentle spinal twists',
          'Reach forward and back mindfully',
          'End with arms wide open, embracing positivity',
        ],
      },
      resources: [], // Will be populated dynamically
      motivationalMessage: '', // Will be generated dynamically
    },
  };

  /**
   * Ultra-fast cache-based coaching generation (0ms)
   * Recommended for demo use
   */
  async generateFastCoaching(
    sentiment: SentimentResult
  ): Promise<CoachingResponse> {
    const { label, score } = sentiment;

    // Crisis detection
    const isCrisisSituation = score < 0.2 && label === 'negative';

    // Use cached response base
    const cachedCoaching =
      OptimizedCoachingService.CACHED_COACHING[label] ||
      OptimizedCoachingService.CACHED_COACHING.neutral;

    // Apply intelligent resource selection and messaging
    return {
      ...cachedCoaching,
      resources: this.selectAppropriateResources(sentiment),
      motivationalMessage: this.generateMotivationalMessage(
        sentiment,
        isCrisisSituation
      ),
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

    // Crisis detection
    const isCrisisSituation = score < 0.2 && label === 'negative';

    // For crisis situations, use immediate cached response with emergency resources
    if (isCrisisSituation) {
      console.log(
        '🚨 Crisis situation detected - providing emergency resources'
      );
      return this.generateFastCoaching(sentiment);
    }

    // Enhanced prompt for personalized coaching
    const prompt = `Sentiment: ${label} (${score.toFixed(2)})
User transcript: "${transcript.substring(0, 150)}..."

Based on this emotional state, provide supportive coaching in JSON format:
{
  "motivationalMessage": "Personalized, empathetic message in English (2-3 sentences)",
  "breathingTip": "Specific breathing exercise description (1-2 lines)",
  "stretchTip": "Helpful stretching or movement suggestion (1-2 lines)"
}

Guidelines:
- Be supportive and professional
- Acknowledge their feelings
- Provide practical, actionable advice
- Use encouraging but not dismissive language`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a supportive mental health coach helping college students. Provide empathetic, practical guidance.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const response = JSON.parse(
        completion.choices[0].message.content || '{}'
      );

      // Combine AI response with cached structure and intelligent resources
      const baseCoaching =
        OptimizedCoachingService.CACHED_COACHING[label] ||
        OptimizedCoachingService.CACHED_COACHING.neutral;

      return {
        ...baseCoaching,
        resources: this.selectAppropriateResources(sentiment),
        motivationalMessage:
          response.motivationalMessage ||
          this.generateMotivationalMessage(sentiment, isCrisisSituation),
        breathingExercise: {
          ...baseCoaching.breathingExercise,
          instructions: response.breathingTip
            ? response.breathingTip
                .split('.')
                .filter((tip: string) => tip.trim())
            : baseCoaching.breathingExercise.instructions,
        },
        stretchExercise: {
          ...baseCoaching.stretchExercise,
          instructions: response.stretchTip
            ? response.stretchTip.split('.').filter((tip: string) => tip.trim())
            : baseCoaching.stretchExercise.instructions,
        },
      };
    } catch (error) {
      console.log(`⚠️ AI coaching failed, using enhanced cache: ${error}`);
      return this.generateFastCoaching(sentiment);
    }
  }

  /**
   * Main coaching generation method with crisis awareness
   * Choose appropriate method based on mode and crisis detection
   */
  async generateCoaching(
    sentiment: SentimentResult,
    transcript: string,
    mode: 'fast' | 'optimized' = 'fast'
  ): Promise<CoachingResponse> {
    const { score, label } = sentiment;
    const isCrisisSituation = score < 0.2 && label === 'negative';

    // Log coaching mode and crisis detection
    console.log(
      `🎛️ Coaching mode: ${mode} | Crisis detected: ${isCrisisSituation ? 'YES' : 'No'} | Sentiment: ${label} (${score})`
    );

    if (isCrisisSituation) {
      // Always use fast mode for crisis situations to ensure immediate response
      console.log(
        '🚨 Crisis situation - using fast mode for immediate support'
      );
      return this.generateFastCoaching(sentiment);
    }

    if (mode === 'fast') {
      return this.generateFastCoaching(sentiment);
    } else {
      return this.generateOptimizedCoaching(sentiment, transcript);
    }
  }

  /**
   * Crisis detection utility method
   */
  detectCrisisSituation(sentiment: SentimentResult): boolean {
    return sentiment.score < 0.2 && sentiment.label === 'negative';
  }

  /**
   * Get crisis-specific resources
   */
  getCrisisResources(): CoachingResponse['resources'] {
    return [
      OptimizedCoachingService.UNIVERSITY_RESOURCES.emergency[0], // Get Help Now - highest priority
      OptimizedCoachingService.UNIVERSITY_RESOURCES.counseling[0], // UHS Mental Health Services
      OptimizedCoachingService.UNIVERSITY_RESOURCES.emergency[1], // Emergency Procedures
    ];
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
