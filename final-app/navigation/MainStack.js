import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import Explore from '../components/Explore';
import HotelDetails from '../components/HotelDetails';
import Booking from '../components/Booking';
import Profile from '../components/Profile';
import Deals from '../components/Deals';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ExploreStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Explore" component={Explore} options={{ headerShown: false }} />
      <Stack.Screen name="HotelDetails" component={HotelDetails} options={{ title: 'Hotel Details' }} />
      <Stack.Screen name="Booking" component={Booking} options={{ title: 'Book Hotel' }} />
    </Stack.Navigator>
  );
};

const MainStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏨</Text>
          ),
        }}
      />
      <Tab.Screen
        name="DealsTab"
        component={Deals}
        options={{
          tabBarLabel: 'Deals',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🔥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainStack;
