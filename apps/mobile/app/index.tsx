import { StyleSheet, Text, View } from 'react-native';

export default function Page() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 'auto',
    maxWidth: 960,
  },
  subtitle: {
    color: '#38434D',
    fontSize: 36,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
  },
});
