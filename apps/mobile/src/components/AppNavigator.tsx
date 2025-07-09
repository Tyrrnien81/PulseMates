import { useAppContext } from '../context/AppContext';
import { HomeScreen } from '../screens/HomeScreen';
import { RecordingScreen } from '../screens/RecordingScreen';
import { ResultsScreen } from '../screens/ResultsScreen';

export function AppNavigator() {
  const { state } = useAppContext();

  switch (state.currentScreen) {
    case 'recording':
      return <RecordingScreen />;
    case 'results':
      return <ResultsScreen />;
    case 'home':
    default:
      return <HomeScreen />;
  }
}
