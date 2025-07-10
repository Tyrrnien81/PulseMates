# PulseMates Phase 4: Frontend Integration Examples

> **React Native Integration Guide for Enhanced AI Coaching & Crisis Detection**  
> **Phase 4 Features:** Crisis Detection, University Resources, Enhanced Coaching  
> **Last Updated:** 2025-01-09

---

## 🚨 Crisis Detection Integration

### Crisis Response Handler

```typescript
// types/api.ts
interface CrisisResponse {
  isCrisis: boolean;
  emergencyResources: Resource[];
  message: string;
  urgencyLevel: 'critical' | 'moderate' | 'low';
}

interface Resource {
  title: string;
  description: string;
  url: string;
  category: 'counseling' | 'meditation' | 'emergency';
  phoneNumber?: string;
}
```

```typescript
// services/crisisDetection.ts
export class CrisisDetectionService {
  static detectCrisis(sentiment: any, coaching: any): CrisisResponse {
    const isCrisis = sentiment.score < 0.2 && sentiment.label === 'negative';

    if (isCrisis) {
      return {
        isCrisis: true,
        emergencyResources: coaching.resources.filter(r => r.category === 'emergency'),
        message: coaching.motivationalMessage,
        urgencyLevel: 'critical',
      };
    }

    return {
      isCrisis: false,
      emergencyResources: [],
      message: coaching.motivationalMessage,
      urgencyLevel: sentiment.score < 0.4 ? 'moderate' : 'low',
    };
  }
}
```

### Crisis UI Components

```tsx
// components/CrisisAlert.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';

interface CrisisAlertProps {
  visible: boolean;
  emergencyResources: Resource[];
  onDismiss: () => void;
}

export const CrisisAlert: React.FC<CrisisAlertProps> = ({
  visible,
  emergencyResources,
  onDismiss,
}) => {
  if (!visible) return null;

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Support',
      "If you're in immediate danger, please call 911. Otherwise, you can reach out to campus resources.",
      [
        { text: 'Call 911', onPress: () => Linking.openURL('tel:911') },
        { text: 'Campus Resources', onPress: () => openFirstResource() },
        { text: 'Not Now', style: 'cancel' },
      ]
    );
  };

  const openFirstResource = () => {
    if (emergencyResources.length > 0) {
      Linking.openURL(emergencyResources[0].url);
    }
  };

  return (
    <View style={styles.crisisContainer}>
      <View style={styles.alertBox}>
        <Text style={styles.crisisTitle}>🚨 Emergency Support Available</Text>
        <Text style={styles.crisisMessage}>
          Your feelings are important. Professional help is available 24/7.
        </Text>

        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
          <Text style={styles.emergencyButtonText}>Get Help Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

### Crisis Styling Theme

```typescript
// styles/crisisTheme.ts
import { StyleSheet } from 'react-native';

export const crisisStyles = StyleSheet.create({
  crisisContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(220, 38, 38, 0.95)', // Red overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626', // Red accent
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  crisisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  crisisMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dismissButtonText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
```

---

## 🏥 University Resources Integration

### Resource Category Manager

```typescript
// services/resourceManager.ts
export class ResourceManager {
  static categorizeResources(resources: Resource[]) {
    return {
      emergency: resources.filter(r => r.category === 'emergency'),
      counseling: resources.filter(r => r.category === 'counseling'),
      meditation: resources.filter(r => r.category === 'meditation'),
    };
  }

  static prioritizeForSentiment(resources: Resource[], sentimentScore: number) {
    if (sentimentScore < 0.2) {
      // Crisis: Emergency first, then counseling
      return [
        ...this.categorizeResources(resources).emergency,
        ...this.categorizeResources(resources).counseling,
      ];
    } else if (sentimentScore < 0.4) {
      // Negative: Counseling first, then meditation
      return [
        ...this.categorizeResources(resources).counseling,
        ...this.categorizeResources(resources).meditation,
      ];
    } else if (sentimentScore < 0.6) {
      // Neutral: Meditation first, then preventive counseling
      return [
        ...this.categorizeResources(resources).meditation,
        ...this.categorizeResources(resources).counseling,
      ];
    } else {
      // Positive: Meditation and growth resources
      return [...this.categorizeResources(resources).meditation];
    }
  }

  static async validateResourceAvailability(resource: Resource): Promise<boolean> {
    try {
      const response = await fetch(resource.url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### Resource Display Component

```tsx
// components/UniversityResources.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';

interface UniversityResourcesProps {
  resources: Resource[];
  sentimentScore: number;
}

export const UniversityResources: React.FC<UniversityResourcesProps> = ({
  resources,
  sentimentScore,
}) => {
  const [prioritizedResources, setPrioritizedResources] = useState<Resource[]>([]);

  useEffect(() => {
    const prioritized = ResourceManager.prioritizeForSentiment(resources, sentimentScore);
    setPrioritizedResources(prioritized);
  }, [resources, sentimentScore]);

  const openResource = (resource: Resource) => {
    Linking.openURL(resource.url);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency':
        return '#DC2626'; // Red
      case 'counseling':
        return '#2563EB'; // Blue
      case 'meditation':
        return '#059669'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency':
        return '🚨';
      case 'counseling':
        return '💬';
      case 'meditation':
        return '🧘';
      default:
        return '🔗';
    }
  };

  return (
    <View style={styles.resourcesContainer}>
      <Text style={styles.resourcesTitle}>University Resources</Text>
      <Text style={styles.resourcesSubtitle}>
        {sentimentScore < 0.2
          ? 'Emergency support is available 24/7'
          : sentimentScore < 0.4
            ? 'Professional counseling services'
            : sentimentScore < 0.6
              ? 'Mindfulness and wellness resources'
              : 'Continue your wellness journey'}
      </Text>

      <ScrollView style={styles.resourcesList}>
        {prioritizedResources.map((resource, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.resourceCard, { borderLeftColor: getCategoryColor(resource.category) }]}
            onPress={() => openResource(resource)}
          >
            <View style={styles.resourceHeader}>
              <Text style={styles.resourceIcon}>{getCategoryIcon(resource.category)}</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text
                  style={[styles.resourceCategory, { color: getCategoryColor(resource.category) }]}
                >
                  {resource.category.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

---

## 🎯 Enhanced Coaching Features

### Professional Breathing Exercise Component

```tsx
// components/BreathingExercise.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface BreathingExerciseProps {
  exercise: {
    title: string;
    instructions: string[];
    duration: number; // in minutes
  };
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ exercise }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [breathAnimation] = useState(new Animated.Value(1));

  const startExercise = () => {
    setIsActive(true);
    setCurrentStep(0);
    animateBreathing();
  };

  const animateBreathing = () => {
    const breathCycle = () => {
      // Inhale (4 seconds)
      Animated.timing(breathAnimation, {
        toValue: 1.5,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold (7 seconds)
        setTimeout(() => {
          // Exhale (8 seconds)
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }).start(() => {
            if (isActive) {
              setCurrentStep(prev => (prev + 1) % exercise.instructions.length);
              breathCycle();
            }
          });
        }, 7000);
      });
    };
    breathCycle();
  };

  const stopExercise = () => {
    setIsActive(false);
    breathAnimation.setValue(1);
  };

  return (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseTitle}>{exercise.title}</Text>
      <Text style={styles.exerciseDuration}>Duration: {exercise.duration} minutes</Text>

      <View style={styles.instructionsList}>
        {exercise.instructions.map((instruction, index) => (
          <Text
            key={index}
            style={[
              styles.instruction,
              currentStep === index && isActive && styles.activeInstruction,
            ]}
          >
            {index + 1}. {instruction}
          </Text>
        ))}
      </View>

      <View style={styles.breathingVisual}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              transform: [{ scale: breathAnimation }],
            },
          ]}
        />
        {isActive && (
          <Text style={styles.breathingText}>
            {currentStep < 4 ? 'Breathe slowly' : 'Complete the cycle'}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.exerciseButton, isActive && styles.activeButton]}
        onPress={isActive ? stopExercise : startExercise}
      >
        <Text style={styles.exerciseButtonText}>
          {isActive ? 'Stop Exercise' : 'Start Breathing'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Enhanced Motivational Messaging

```tsx
// components/MotivationalMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface MotivationalMessageProps {
  message: string;
  sentimentScore: number;
  isCrisis: boolean;
}

export const MotivationalMessage: React.FC<MotivationalMessageProps> = ({
  message,
  sentimentScore,
  isCrisis,
}) => {
  const getMessageStyle = () => {
    if (isCrisis) {
      return {
        ...styles.messageContainer,
        backgroundColor: '#FEF2F2', // Light red background
        borderColor: '#DC2626',
      };
    } else if (sentimentScore < 0.4) {
      return {
        ...styles.messageContainer,
        backgroundColor: '#F3F4F6', // Light gray background
        borderColor: '#6B7280',
      };
    } else if (sentimentScore > 0.6) {
      return {
        ...styles.messageContainer,
        backgroundColor: '#F0FDF4', // Light green background
        borderColor: '#059669',
      };
    }
    return styles.messageContainer;
  };

  const getMessageIcon = () => {
    if (isCrisis) return '🤝';
    if (sentimentScore < 0.4) return '💙';
    if (sentimentScore > 0.6) return '✨';
    return '🌱';
  };

  return (
    <View style={getMessageStyle()}>
      <Text style={styles.messageIcon}>{getMessageIcon()}</Text>
      <Text style={styles.messageText}>{message}</Text>
      {isCrisis && (
        <Text style={styles.crisisNote}>
          Professional support is available 24/7. You are not alone.
        </Text>
      )}
    </View>
  );
};
```

---

## 📱 Complete Integration Example

### Main Check-in Screen

```tsx
// screens/CheckinScreen.tsx
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { CrisisDetectionService } from '../services/crisisDetection';
import { CrisisAlert } from '../components/CrisisAlert';
import { UniversityResources } from '../components/UniversityResources';
import { MotivationalMessage } from '../components/MotivationalMessage';

export const CheckinScreen: React.FC = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const handleAudioUpload = async (audioFile: any) => {
    try {
      const response = await uploadAudio(audioFile);
      setApiResponse(response);

      // Phase 4: Crisis Detection
      const crisisAnalysis = CrisisDetectionService.detectCrisis(
        response.data.sentiment,
        response.data.coaching
      );

      if (crisisAnalysis.isCrisis) {
        setShowCrisisAlert(true);
        // Log crisis detection for support team
        console.log('🚨 Crisis detected:', {
          sessionId: response.data.sessionId,
          sentimentScore: response.data.sentiment.score,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process audio. Please try again.');
    }
  };

  if (!apiResponse) {
    return <AudioRecorder onUpload={handleAudioUpload} />;
  }

  const { sentiment, coaching } = apiResponse.data;
  const crisisAnalysis = CrisisDetectionService.detectCrisis(sentiment, coaching);

  return (
    <View style={styles.container}>
      <CrisisAlert
        visible={showCrisisAlert}
        emergencyResources={crisisAnalysis.emergencyResources}
        onDismiss={() => setShowCrisisAlert(false)}
      />

      <MotivationalMessage
        message={coaching.motivationalMessage}
        sentimentScore={sentiment.score}
        isCrisis={crisisAnalysis.isCrisis}
      />

      <UniversityResources resources={coaching.resources} sentimentScore={sentiment.score} />

      <BreathingExercise exercise={coaching.breathingExercise} />
    </View>
  );
};
```

### Error Handling for Phase 4

```typescript
// services/errorHandling.ts
export class Phase4ErrorHandler {
  static handleCrisisDetectionError(error: any, sessionId: string) {
    console.error('Crisis detection failed:', error);

    // Fallback: Show emergency resources anyway
    return {
      isCrisis: true,
      emergencyResources: [
        {
          title: 'Emergency Services',
          description: 'Call 911 for immediate help',
          url: 'tel:911',
          category: 'emergency',
        },
      ],
      message: "If you're in crisis, please call 911 or go to your nearest emergency room.",
      urgencyLevel: 'critical',
    };
  }

  static handleResourceLoadError(resource: Resource) {
    Alert.alert(
      'Resource Unavailable',
      `${resource.title} is temporarily unavailable. Please try again later or contact campus support directly.`,
      [{ text: 'OK' }, { text: 'Call Campus', onPress: () => Linking.openURL('tel:+16082631122') }]
    );
  }
}
```

---

## ✅ Testing Integration

### Unit Tests for Phase 4

```typescript
// __tests__/CrisisDetection.test.ts
import { CrisisDetectionService } from '../services/crisisDetection';

describe('Crisis Detection Service', () => {
  test('detects crisis for score < 0.2', () => {
    const sentiment = { score: 0.1, label: 'negative' };
    const coaching = {
      resources: [{ title: 'Get Help Now', category: 'emergency' }],
      motivationalMessage: 'You are not alone',
    };

    const result = CrisisDetectionService.detectCrisis(sentiment, coaching);

    expect(result.isCrisis).toBe(true);
    expect(result.urgencyLevel).toBe('critical');
    expect(result.emergencyResources.length).toBeGreaterThan(0);
  });

  test('does not detect crisis for moderate negative', () => {
    const sentiment = { score: 0.3, label: 'negative' };
    const coaching = { resources: [], motivationalMessage: 'Keep going' };

    const result = CrisisDetectionService.detectCrisis(sentiment, coaching);

    expect(result.isCrisis).toBe(false);
    expect(result.urgencyLevel).toBe('moderate');
  });
});
```

### Integration Testing Checklist

**Phase 4 Mobile Integration Tests:**

- [ ] Crisis detection triggers emergency alert UI
- [ ] Emergency resources are prioritized in crisis situations
- [ ] University resources open correctly in mobile browser
- [ ] Crisis messaging displays appropriately
- [ ] Enhanced breathing exercises function properly
- [ ] Resource categorization works for all emotional states
- [ ] Crisis alert can be dismissed safely
- [ ] Professional tone maintained across all scenarios
- [ ] Error handling works for resource loading failures
- [ ] Analytics logging captures crisis detections

---

**🚀 This integration guide ensures your React Native app can fully utilize the Phase 4 Enhanced AI
Coaching and Crisis Detection features while maintaining a professional, supportive user
experience.**
