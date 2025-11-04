import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Onboarding from './components/Onboarding';
import AuthStack from './navigation/AuthStack';
import MainStack from './navigation/MainStack';

export default function App() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      try {
        if (user) {
          const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
          const isOnboardingCompleted = onboardingCompleted === 'true';
          setShowOnboarding(!isOnboardingCompleted);
        } else {
          const hasSignedUp = await AsyncStorage.getItem('hasSignedUp');
          const isSignedUp = hasSignedUp === 'true';
          if (isSignedUp) {
            setShowOnboarding(false);
          } else {
            setShowOnboarding(null);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setShowOnboarding(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  if (showOnboarding === true) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
