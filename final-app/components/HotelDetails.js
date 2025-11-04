import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../firebaseConfig';

const HotelDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotel } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={hotel.image} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.location}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {hotel.rating}</Text>
        </View>
        <Text style={styles.price}>${hotel.price} per night</Text>
        <Text style={styles.description}>
          {hotel.description || 'A wonderful hotel offering comfortable stays and excellent amenities. Enjoy your stay with us!'}
        </Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            if (auth.currentUser) {
              navigation.navigate('Booking', { hotel });
            } else {
              Alert.alert('Authentication Required', 'Please sign in to book a hotel.', [
                { text: 'OK' }
              ]);
            }
          }}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Explore</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  bookButtonText: {
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

export default HotelDetails;
