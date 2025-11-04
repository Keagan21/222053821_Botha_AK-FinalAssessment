import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Booking = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotel } = route.params;

  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [rooms, setRooms] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const calculateDays = () => {
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalCost = () => {
    const days = calculateDays();
    return days * hotel.price * rooms;
  };

  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      Alert.alert('Invalid Date', 'Check-in date cannot be in the past.');
      return false;
    }
    if (checkOutDate <= checkInDate) {
      Alert.alert('Invalid Date', 'Check-out date must be after check-in date.');
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    if (!validateDates()) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to make a booking');
      return;
    }

    const bookingDetails = {
      hotel: hotel.name,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      rooms,
      totalCost: calculateTotalCost(),
      days: calculateDays(),
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    Alert.alert(
      'Confirm Booking',
      `Hotel: ${bookingDetails.hotel}\nCheck-in: ${checkInDate.toDateString()}\nCheck-out: ${checkOutDate.toDateString()}\nRooms: ${bookingDetails.rooms}\nTotal: $${bookingDetails.totalCost}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await addDoc(collection(db, 'bookings'), bookingDetails);
              Alert.alert('Success', 'Your booking has been confirmed!', [
                { text: 'OK', onPress: () => navigation.navigate('Explore') }
              ]);
            } catch (error) {
              console.error('Error saving booking:', error);
              Alert.alert('Error', 'Failed to save booking. Please try again.');
            }
          }
        }
      ]
    );
  };

  const onCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckInDate(selectedDate);
    }
  };

  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book {hotel.name}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check-in Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowCheckInPicker(true)}>
          <Text style={styles.dateText}>{checkInDate.toDateString()}</Text>
        </TouchableOpacity>
        {showCheckInPicker && (
          <DateTimePicker
            value={checkInDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onCheckInChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Check-out Date</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowCheckOutPicker(true)}>
          <Text style={styles.dateText}>{checkOutDate.toDateString()}</Text>
        </TouchableOpacity>
        {showCheckOutPicker && (
          <DateTimePicker
            value={checkOutDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onCheckOutChange}
            minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Rooms</Text>
        <View style={styles.roomSelector}>
          <TouchableOpacity
            style={styles.roomButton}
            onPress={() => setRooms(Math.max(1, rooms - 1))}
          >
            <Text style={styles.roomButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.roomCount}>{rooms}</Text>
          <TouchableOpacity
            style={styles.roomButton}
            onPress={() => setRooms(rooms + 1)}
          >
            <Text style={styles.roomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <Text style={styles.summaryText}>Hotel: {hotel.name}</Text>
        <Text style={styles.summaryText}>Location: {hotel.location}</Text>
        <Text style={styles.summaryText}>Nights: {calculateDays()}</Text>
        <Text style={styles.summaryText}>Rooms: {rooms}</Text>
        <Text style={styles.totalCost}>Total Cost: ${calculateTotalCost()}</Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Hotel Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  roomSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomButton: {
    backgroundColor: '#007bff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  totalCost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Booking;
