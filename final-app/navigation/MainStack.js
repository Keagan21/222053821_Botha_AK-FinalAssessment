import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Explore from '../components/Explore';
import HotelDetails from '../components/HotelDetails';
import Booking from '../components/Booking';

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Explore" component={Explore} options={{ headerShown: false }} />
      <Stack.Screen name="HotelDetails" component={HotelDetails} options={{ title: 'Hotel Details' }} />
      <Stack.Screen name="Booking" component={Booking} options={{ title: 'Book Hotel' }} />
    </Stack.Navigator>
  );
};

export default MainStack;
