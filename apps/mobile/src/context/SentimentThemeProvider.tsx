import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  SentimentTheme,
  getThemeForSentiment,
  neutralTheme,
  interpolateTheme,
} from '../constants/SentimentTheme';
import { useAppContext } from './AppContext';

interface SentimentThemeContextType {
  theme: SentimentTheme;
  isTransitioning: boolean;
  sentimentLevel: 'positive' | 'neutral' | 'negative';
}

const SentimentThemeContext = createContext<
  SentimentThemeContextType | undefined
>(undefined);

export function SentimentThemeProvider({ children }: { children: ReactNode }) {
  const { state } = useAppContext();
  const [theme, setTheme] = useState<SentimentTheme>(neutralTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sentimentLevel, setSentimentLevel] = useState<
    'positive' | 'neutral' | 'negative'
  >('neutral');

  useEffect(() => {
    // Only update theme if we have sentiment data
    if (!state.checkinData.sentiment) {
      return;
    }

    const sentimentScore = state.checkinData.sentiment.score;
    const newTheme = getThemeForSentiment(sentimentScore);

    // Determine sentiment level
    const newLevel =
      sentimentScore >= 0.7
        ? 'positive'
        : sentimentScore >= 0.4
          ? 'neutral'
          : 'negative';

    // Only transition if the theme actually changed
    if (newLevel !== sentimentLevel) {
      setIsTransitioning(true);
      setSentimentLevel(newLevel);

      // Animate theme transition
      const startTime = Date.now();
      const duration = 800; // ms
      const startTheme = theme;

      const animateTheme = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use easing function for smooth transition
        const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        const interpolatedTheme = interpolateTheme(
          startTheme,
          newTheme,
          easeProgress
        );
        setTheme(interpolatedTheme);

        if (progress < 1) {
          requestAnimationFrame(animateTheme);
        } else {
          setTheme(newTheme);
          setIsTransitioning(false);
        }
      };

      requestAnimationFrame(animateTheme);
    }
  }, [state.checkinData.sentiment, sentimentLevel, theme]);

  const contextValue: SentimentThemeContextType = {
    theme,
    isTransitioning,
    sentimentLevel,
  };

  return (
    <SentimentThemeContext.Provider value={contextValue}>
      {children}
    </SentimentThemeContext.Provider>
  );
}

export function useSentimentTheme(): SentimentThemeContextType {
  const context = useContext(SentimentThemeContext);
  if (context === undefined) {
    throw new Error(
      'useSentimentTheme must be used within a SentimentThemeProvider'
    );
  }
  return context;
}

// Hook for components that need to style based on sentiment theme
export function useThemedStyles<T>(
  styleCreator: (theme: SentimentTheme) => T
): T {
  const { theme } = useSentimentTheme();
  return styleCreator(theme);
}
