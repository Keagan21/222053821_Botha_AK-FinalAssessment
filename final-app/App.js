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

const safeGetAsyncStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    const stringValue = String(value);
    if (stringValue !== 'true' && stringValue !== 'false' && stringValue !== '') {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return stringValue;
  } catch (error) {
    console.error(`Error reading ${key} from AsyncStorage:`, error);
    try {
      await AsyncStorage.removeItem(key);
    } catch (removeError) {
      console.error(`Error removing ${key}:`, removeError);
    }
    return null;
  }
};

const clearCorruptedStorage = async () => {
  try {
    const keys = ['onboardingCompleted', 'hasSignedUp'];
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          try {
            const testValue = String(value);
            if (testValue !== 'true' && testValue !== 'false') {
              await AsyncStorage.removeItem(key);
              console.log(`Cleared corrupted ${key}`);
            }
          } catch (castError) {
            await AsyncStorage.removeItem(key);
            console.log(`Cleared corrupted ${key} due to cast error`);
          }
        }
      } catch (error) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (removeError) {
          console.error(`Could not clear ${key}:`, removeError);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing corrupted storage:', error);
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await clearCorruptedStorage();
    };
    initialize();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      try {
        if (user) {
          const onboardingCompleted = await safeGetAsyncStorage('onboardingCompleted');
          const isOnboardingCompleted = onboardingCompleted === 'true';
          setShowOnboarding(!isOnboardingCompleted);
        } else {
          const hasSignedUp = await safeGetAsyncStorage('hasSignedUp');
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
