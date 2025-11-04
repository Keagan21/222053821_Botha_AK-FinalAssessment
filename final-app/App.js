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

const STORAGE_VERSION = '1.0.1';

const safeGetAsyncStorage = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value === null) return null;
    if (typeof value !== 'string') {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return value;
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

const performStorageMigration = async () => {
  let migrationVersion = null;
  try {
    migrationVersion = await AsyncStorage.getItem('storage_version');
  } catch (error) {
    console.log('Could not read storage_version, will perform migration');
  }
  
  if (migrationVersion !== STORAGE_VERSION) {
    console.log('Performing storage migration - clearing all AsyncStorage data');
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      if (allKeys && allKeys.length > 0) {
        await AsyncStorage.multiRemove(allKeys);
        console.log('Cleared all AsyncStorage keys');
      }
    } catch (clearError) {
      console.error('Error clearing AsyncStorage:', clearError);
      try {
        const keys = ['onboardingCompleted', 'hasSignedUp', '@react-native-async-storage/async-storage'];
        for (const key of keys) {
          try {
            await AsyncStorage.removeItem(key);
          } catch (e) {
            console.error(`Could not remove ${key}:`, e);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback cleanup failed:', fallbackError);
      }
    }
    
    try {
      await AsyncStorage.setItem('storage_version', STORAGE_VERSION);
    } catch (versionError) {
      console.error('Error setting storage version:', versionError);
    }
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await performStorageMigration();
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
