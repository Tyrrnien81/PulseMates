import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../constants/Colors';
import { typography } from '../constants/Typography';
import { spacing, borderRadius } from '../constants/Layout';
import { Card } from './ui/Card';
import {
  ConfidenceIndicator,
  CompactConfidenceIndicator,
} from './ConfidenceIndicator';

export interface TranscriptDisplayProps {
  transcript: string;
  isStreaming?: boolean;
  confidence?: number;
  enableTypewriter?: boolean;
  typewriterSpeed?: number; // milliseconds per character
  showDetailedConfidence?: boolean;
  onTypewriterComplete?: () => void;
  audioUrl?: string; // Optional coaching audio URL
}

export function TranscriptDisplay({
  transcript,
  isStreaming = false,
  confidence,
  enableTypewriter = true,
  typewriterSpeed = 50,
  showDetailedConfidence = false,
  onTypewriterComplete,
  audioUrl,
}: TranscriptDisplayProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typewriterRef = useRef<number | null>(null);

  // Typewriter effect
  useEffect(() => {
    if (!enableTypewriter || !transcript) {
      setDisplayedText(transcript);
      return;
    }

    // Clear any existing typewriter animation
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    setIsTyping(true);
    setDisplayedText('');
    let currentIndex = 0;

    typewriterRef.current = setInterval(() => {
      if (currentIndex <= transcript.length) {
        setDisplayedText(transcript.slice(0, currentIndex));
        currentIndex++;

        // Auto-scroll to bottom as text appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Typewriter complete
        clearInterval(typewriterRef.current!);
        setIsTyping(false);
        onTypewriterComplete?.();
      }
    }, typewriterSpeed);

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, [transcript, enableTypewriter, typewriterSpeed, onTypewriterComplete]);

  // Auto-scroll when transcript updates during streaming
  useEffect(() => {
    if (isStreaming) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [transcript, isStreaming]);

  return (
    <Card variant="elevated" padding="lg" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isStreaming ? 'Live Transcript' : 'What You Shared'}
        </Text>
        {confidence !== undefined && (
          <CompactConfidenceIndicator confidence={confidence} />
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.transcriptScrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.transcriptContainer}>
          {displayedText || transcript ? (
            <>
              <Text style={styles.transcriptText}>
                &ldquo;{displayedText || transcript}
                {isTyping && <Text style={styles.cursor}>|</Text>}&rdquo;
              </Text>
              {isStreaming && (
                <View style={styles.streamingIndicator}>
                  <Text style={styles.streamingText}>● Live</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.placeholderText}>
              {isStreaming
                ? 'Listening... Start speaking to see your words appear here.'
                : 'Your transcript will appear here once processing is complete.'}
            </Text>
          )}
        </View>
      </ScrollView>

      {isStreaming && (
        <View style={styles.streamingBar}>
          <View style={styles.streamingDot} />
          <Text style={styles.streamingBarText}>Processing speech...</Text>
        </View>
      )}

      {showDetailedConfidence && confidence !== undefined && (
        <ConfidenceIndicator
          confidence={confidence}
          type="transcript"
          style={styles.detailedConfidence}
        />
      )}

      {/* Minimalistic Audio Player */}
      {audioUrl && (
        <View style={styles.audioPlayerContainer}>
          <View style={styles.audioPlayerInfo}>
            <Text style={styles.audioPlayerIcon}>🎵</Text>
            <Text style={styles.audioPlayerText}>Coaching Audio</Text>
          </View>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() =>
              Alert.alert('Audio Player', 'Audio playback feature coming soon!')
            }
          >
            <Text style={styles.playButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  audioPlayerContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  audioPlayerIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  audioPlayerInfo: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  audioPlayerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  container: {
    marginBottom: spacing.lg,
    maxHeight: 300, // Limit height to prevent taking up entire screen
  },
  cursor: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  detailedConfidence: {
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  playButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  streamingBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  streamingBarText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  streamingDot: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  streamingIndicator: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  streamingText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  transcriptContainer: {
    minHeight: 80, // Minimum height to prevent layout shifts
    paddingVertical: spacing.sm,
  },
  transcriptScrollView: {
    flexGrow: 1,
    maxHeight: 200, // Max height for scrolling
  },
  transcriptText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});
