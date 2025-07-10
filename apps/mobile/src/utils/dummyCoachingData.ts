import { CheckinResponse } from '../services/api';

type CoachingData = CheckinResponse['coaching'];
type SentimentScore = number;

// Dummy coaching data based on sentiment analysis
export const generateDummyCoaching = (
  sentimentScore?: SentimentScore
): CoachingData => {
  const score = sentimentScore || 0.5;

  // Sentiment-based coaching content
  const getSentimentBasedContent = () => {
    if (score < 0.4) {
      // Negative sentiment - calming and supportive
      return {
        breathingExercise: {
          title: '4-7-8 Calming Breath',
          instructions: [
            'Find a comfortable seated position with your back straight',
            'Place your tongue tip against your upper teeth ridge',
            'Exhale completely through your mouth with a whoosh sound',
            'Close your mouth and inhale through your nose for 4 counts',
            'Hold your breath for 7 counts',
            'Exhale through your mouth for 8 counts with a whoosh',
            'Repeat this cycle 3-4 times for maximum calming effect',
          ],
          duration: 300, // 5 minutes
        },
        stretchExercise: {
          title: 'Tension Release Sequence',
          instructions: [
            'Slowly roll your shoulders backward 5 times, then forward 5 times',
            'Gently tilt your head to the right, hold for 15 seconds',
            'Tilt your head to the left, hold for 15 seconds',
            'Look up towards the ceiling, hold for 10 seconds',
            'Bring your chin to your chest, hold for 10 seconds',
            'Clasp your hands behind your back and gently lift',
            'Take 3 deep breaths and feel the tension melting away',
          ],
          imageUrl: 'https://example.com/tension-release.jpg',
        },
        motivationalMessage:
          "I hear that you're going through a tough time right now, and I want you to know that what you're feeling is completely valid. Stress and difficult emotions are a natural part of life, especially when we're facing challenges. Remember that you have the strength to get through this - you've overcome difficulties before, and you can do it again. Taking time for self-care, like the breathing exercises we'll do together, is not selfish - it's necessary. You're taking a positive step by checking in with yourself today.",
      };
    } else if (score < 0.7) {
      // Neutral sentiment - balancing and centering
      return {
        breathingExercise: {
          title: 'Box Breathing for Balance',
          instructions: [
            'Sit comfortably with your feet flat on the floor',
            'Rest your hands gently on your knees',
            'Inhale through your nose for 4 counts',
            'Hold your breath for 4 counts',
            'Exhale through your mouth for 4 counts',
            'Hold empty for 4 counts',
            'Repeat this square pattern 6-8 times',
            'Focus on creating equal sides of your breathing box',
          ],
          duration: 240, // 4 minutes
        },
        stretchExercise: {
          title: 'Mindful Movement Flow',
          instructions: [
            'Stand tall and reach your arms overhead, take a deep breath',
            'Gently sway from side to side like a tree in the wind',
            'Bring your arms down and roll your shoulders in circles',
            'Step your feet hip-width apart and twist gently left and right',
            'Reach toward your toes and hang forward for a moment',
            'Slowly roll up vertebra by vertebra to standing',
            'End with 3 intentional breaths, feeling centered and balanced',
          ],
          imageUrl: 'https://example.com/mindful-movement.jpg',
        },
        motivationalMessage:
          "You're in a good place to take a moment and check in with yourself. Sometimes life feels steady, and that's perfectly okay - not every day needs to be extraordinary. These balanced moments are actually opportunities to build resilience and practice self-awareness. The breathing and movement exercises can help you stay grounded and maintain this sense of equilibrium. Trust in your ability to navigate whatever comes your way with grace and mindfulness.",
      };
    } else {
      // Positive sentiment - energizing and celebrating
      return {
        breathingExercise: {
          title: 'Energizing Victory Breath',
          instructions: [
            'Stand up tall with your feet shoulder-width apart',
            'Raise your arms above your head in a V-shape',
            'Take a powerful inhale through your nose for 3 counts',
            'Hold the breath while feeling your strength for 2 counts',
            "Exhale with a strong 'HA!' sound while bringing arms down",
            'Shake out your whole body for 5 seconds',
            'Repeat 5 times, celebrating your positive energy',
            'End with a big smile and gratitude for this moment',
          ],
          duration: 180, // 3 minutes
        },
        stretchExercise: {
          title: 'Joyful Energy Release',
          instructions: [
            'March in place while swinging your arms freely',
            'Reach one arm across your body and hold for 10 seconds',
            'Switch arms and stretch the other side',
            'Interlace your fingers and stretch your arms overhead',
            'Bend to one side, then the other, keeping arms up',
            'Do 5 gentle jumping jacks or bounce on your toes',
            'Finish with arms wide open, taking up space with confidence',
          ],
          imageUrl: 'https://example.com/joyful-energy.jpg',
        },
        motivationalMessage:
          "What a wonderful energy you're bringing today! It's beautiful to feel positive and optimistic - this is your natural state of being, and you deserve to feel this good. When we're in a positive space, it's a perfect time to practice gratitude and maybe even share this good energy with others around us. Keep building on this momentum, and remember that you have the power to create more moments like this. Your positive outlook is a strength that can carry you through any challenge.",
      };
    }
  };

  const sentimentContent = getSentimentBasedContent();

  // Comprehensive resources based on different categories
  const resources = [
    // Emergency resources
    {
      title: 'Crisis Text Line',
      description: 'Free 24/7 mental health crisis support via text message',
      url: 'https://crisistextline.org',
      category: 'emergency' as const,
    },
    {
      title: 'National Suicide Prevention Lifeline',
      description: '24/7 free and confidential support for people in distress',
      url: 'tel:988',
      category: 'emergency' as const,
    },

    // Counseling resources
    {
      title: 'University Counseling Center',
      description: 'Free confidential counseling services for students',
      url: 'https://university.edu/counseling',
      category: 'counseling' as const,
    },
    {
      title: 'BetterHelp Online Therapy',
      description: 'Professional therapy accessible from anywhere',
      url: 'https://betterhelp.com/students',
      category: 'counseling' as const,
    },
    {
      title: 'Psychology Today Therapist Finder',
      description: 'Find local mental health professionals in your area',
      url: 'https://psychologytoday.com/therapists',
      category: 'counseling' as const,
    },

    // Meditation & self-care resources
    {
      title: 'Headspace for Students',
      description: 'Free meditation app with guided mindfulness exercises',
      url: 'https://headspace.com/students',
      category: 'meditation' as const,
    },
    {
      title: 'Calm App',
      description: 'Sleep stories, meditation, and relaxation techniques',
      url: 'https://calm.com',
      category: 'meditation' as const,
    },
    {
      title: 'Insight Timer',
      description: 'Free meditation app with thousands of guided sessions',
      url: 'https://insighttimer.com',
      category: 'meditation' as const,
    },
  ];

  return {
    breathingExercise: sentimentContent.breathingExercise,
    stretchExercise: sentimentContent.stretchExercise,
    resources: resources,
    motivationalMessage: sentimentContent.motivationalMessage,
  };
};

// Enhanced coaching data that merges backend data with dummy fallbacks
export const enhanceCoachingData = (
  backendCoaching?: Partial<CoachingData>,
  sentimentScore?: SentimentScore
): CoachingData => {
  const dummyData = generateDummyCoaching(sentimentScore);

  return {
    breathingExercise:
      backendCoaching?.breathingExercise || dummyData.breathingExercise,
    stretchExercise:
      backendCoaching?.stretchExercise || dummyData.stretchExercise,
    resources: backendCoaching?.resources || dummyData.resources,
    motivationalMessage:
      backendCoaching?.motivationalMessage || dummyData.motivationalMessage,
  };
};

// Quick test data for development
export const sampleCoachingData = {
  negative: generateDummyCoaching(0.2),
  neutral: generateDummyCoaching(0.5),
  positive: generateDummyCoaching(0.8),
};
