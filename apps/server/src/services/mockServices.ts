import { SentimentResult, CoachingResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock Speech-to-Text Service
export class MockSTTService {
  static async transcribe(_audioFilePath: string): Promise<{
    transcript: string;
    confidence: number;
    processingTime: number;
  }> {
    // Simulate processing time (500ms - 1.5s)
    const processingTime = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Mock transcript based on common mental health check-in phrases
    const mockTranscripts = [
      "I've been feeling a bit stressed lately with all the assignments and exams coming up.",
      'Today was actually pretty good! I managed to finish my project and felt accomplished.',
      "I'm struggling with anxiety about my future career and whether I'm making the right choices.",
      'Had a rough day today. Feeling overwhelmed with everything on my plate.',
      "Feeling grateful for my friends and family. They've been really supportive lately.",
      "I've been having trouble sleeping because my mind keeps racing about deadlines.",
      'Things are going okay, just taking it one day at a time.',
      'I feel excited about the new semester starting and the opportunities ahead.',
    ];

    const transcript =
      mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    return {
      transcript,
      confidence,
      processingTime: Math.round(processingTime),
    };
  }
}

// Mock Sentiment Analysis Service
export class MockSentimentService {
  static async analyzeSentiment(transcript: string): Promise<SentimentResult> {
    // Simulate processing time (200ms - 800ms)
    const processingTime = Math.random() * 600 + 200;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Basic sentiment analysis based on keywords
    const positiveKeywords = [
      'good',
      'great',
      'happy',
      'excited',
      'accomplished',
      'grateful',
      'supportive',
    ];
    const negativeKeywords = [
      'stressed',
      'anxiety',
      'struggling',
      'rough',
      'overwhelmed',
      'trouble',
      'worried',
    ];

    const lowerTranscript = transcript.toLowerCase();
    const positiveCount = positiveKeywords.filter(word =>
      lowerTranscript.includes(word)
    ).length;
    const negativeCount = negativeKeywords.filter(word =>
      lowerTranscript.includes(word)
    ).length;

    let label: 'positive' | 'negative' | 'neutral';
    let score: number;

    if (positiveCount > negativeCount) {
      label = 'positive';
      score = Math.random() * 0.3 + 0.7; // 70-100%
    } else if (negativeCount > positiveCount) {
      label = 'negative';
      score = Math.random() * 0.3 + 0.1; // 10-40%
    } else {
      label = 'neutral';
      score = Math.random() * 0.4 + 0.4; // 40-80%
    }

    const confidence = Math.random() * 0.2 + 0.8; // 80-100% confidence

    return {
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      label,
      confidence: Math.round(confidence * 100) / 100,
    };
  }
}

// Mock AI Coaching Service
export class MockCoachingService {
  static async generateCoaching(
    sentiment: SentimentResult,
    transcript: string
  ): Promise<CoachingResponse> {
    // Simulate processing time (1s - 2s)
    const processingTime = Math.random() * 1000 + 1000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    const coaching: CoachingResponse = {
      breathingExercise: this.getBreathingExercise(sentiment.label),
      stretchExercise: this.getStretchExercise(sentiment.label),
      resources: this.getResources(sentiment.label),
      motivationalMessage: this.getMotivationalMessage(
        sentiment.label,
        transcript
      ),
    };

    return coaching;
  }

  private static getBreathingExercise(sentiment: string) {
    const exercises = {
      positive: {
        title: 'Gratitude Breathing',
        instructions: [
          'Take a comfortable seated position',
          "Breathe in for 4 counts, thinking of something you're grateful for",
          'Hold for 4 counts, feeling that gratitude',
          'Exhale for 6 counts, releasing any tension',
          'Repeat 5 times',
        ],
        duration: 3,
      },
      negative: {
        title: 'Calming Breath',
        instructions: [
          'Find a quiet place to sit or lie down',
          'Place one hand on your chest, one on your belly',
          'Breathe in slowly through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale completely through your mouth for 8 counts',
          'Repeat 4 times',
        ],
        duration: 5,
      },
      neutral: {
        title: 'Box Breathing',
        instructions: [
          'Sit with your back straight and feet flat on the floor',
          'Breathe in through your nose for 4 counts',
          'Hold your breath for 4 counts',
          'Exhale through your mouth for 4 counts',
          'Hold for 4 counts before starting again',
          'Continue for 2-3 minutes',
        ],
        duration: 4,
      },
    };

    return exercises[sentiment as keyof typeof exercises] || exercises.neutral;
  }

  private static getStretchExercise(sentiment: string) {
    const stretches = {
      positive: {
        title: 'Energy Boosting Stretch',
        instructions: [
          'Stand tall with feet hip-width apart',
          'Reach both arms overhead and stretch up',
          'Gently bend to one side, then the other',
          'Roll your shoulders back and down',
          'Take 3 deep breaths in this position',
        ],
      },
      negative: {
        title: 'Tension Release Stretch',
        instructions: [
          'Sit comfortably in your chair',
          'Roll your shoulders up, back, and down',
          'Gently turn your head left and right',
          'Stretch your arms across your body',
          'Take slow, deep breaths with each movement',
        ],
      },
      neutral: {
        title: 'Mindful Movement',
        instructions: [
          'Stand and take a moment to notice your posture',
          'Slowly raise your arms above your head',
          'Gently twist your torso left and right',
          'Bend forward slightly and let your arms hang',
          'Return to standing and take 3 deep breaths',
        ],
      },
    };

    return stretches[sentiment as keyof typeof stretches] || stretches.neutral;
  }

  private static getResources(
    sentiment: string
  ): CoachingResponse['resources'] {
    const baseResources: CoachingResponse['resources'] = [
      {
        title: 'University Counseling Center',
        description: 'Free counseling services for students',
        url: 'https://counseling.university.edu',
        category: 'counseling',
      },
      {
        title: 'Mindfulness Meditation App',
        description: 'Guided meditation for stress relief',
        url: 'https://meditation-app.com',
        category: 'meditation',
      },
    ];

    if (sentiment === 'negative') {
      baseResources.push({
        title: 'Crisis Support Hotline',
        description: '24/7 support for mental health crises',
        url: 'tel:988',
        category: 'emergency',
      });
    }

    return baseResources;
  }

  private static getMotivationalMessage(
    sentiment: string,
    _transcript: string
  ) {
    const messages = {
      positive: [
        "It's wonderful to hear that you're feeling good! Keep nurturing that positive energy.",
        'Your positive outlook is a strength. Remember to celebrate these good moments.',
        "You're doing great! This positive mindset can help you tackle any challenges ahead.",
      ],
      negative: [
        "Thank you for sharing how you're feeling. It takes courage to acknowledge difficult emotions.",
        "Remember that it's okay to feel this way. You're not alone, and things can get better.",
        'These feelings are temporary. You have the strength to work through this challenging time.',
      ],
      neutral: [
        'Taking time to check in with yourself is a healthy habit. Keep it up!',
        "It sounds like you're managing things well. Remember to take care of yourself.",
        "Steady progress is still progress. You're doing well by staying mindful of your mental health.",
      ],
    };

    const sentimentMessages =
      messages[sentiment as keyof typeof messages] || messages.neutral;
    return sentimentMessages[
      Math.floor(Math.random() * sentimentMessages.length)
    ];
  }
}

// Mock Text-to-Speech Service
export class MockTTSService {
  static async generateSpeech(text: string): Promise<{
    audioUrl: string;
    duration: number;
    fileSize: number;
    format: 'mp3';
  }> {
    // Simulate processing time (800ms - 1.5s)
    const processingTime = Math.random() * 700 + 800;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate audio file details
    const duration = Math.floor(text.length / 15); // Roughly 15 chars per second
    const fileSize = duration * 32000; // Approximate file size

    // Generate a mock audio URL (in real implementation, this would be a real file)
    const audioUrl = `https://api.pulsemates.com/audio/${uuidv4()}.mp3`;

    return {
      audioUrl,
      duration,
      fileSize,
      format: 'mp3',
    };
  }
}
