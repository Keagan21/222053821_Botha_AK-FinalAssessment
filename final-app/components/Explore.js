import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Sample hotel data
const sampleHotels = [
  {
    id: '1',
    name: 'Grand Plaza Hotel',
    location: 'New York, NY',
    rating: 4.5,
    price: 250,
    image: require('../Files/Materials/06-Explore Page/image-1.png'),
    description: 'Luxurious hotel in the heart of Manhattan with stunning city views.'
  },
  {
    id: '2',
    name: 'Seaside Resort',
    location: 'Miami, FL',
    rating: 4.2,
    price: 180,
    image: require('../Files/Materials/06-Explore Page/image-4.png'),
    description: 'Beachfront resort with private balconies and ocean access.'
  },
  {
    id: '3',
    name: 'Mountain View Lodge',
    location: 'Aspen, CO',
    rating: 4.8,
    price: 320,
    image: require('../Files/Materials/06-Explore Page/image-13.png'),
    description: 'Cozy mountain lodge with ski-in/ski-out access and fireplaces.'
  },
  {
    id: '4',
    name: 'Urban Boutique Hotel',
    location: 'San Francisco, CA',
    rating: 4.3,
    price: 220,
    image: require('../Files/Materials/06-Explore Page/image-14.png'),
    description: 'Modern boutique hotel in the vibrant SoMa district.'
  },
  {
    id: '5',
    name: 'Desert Oasis Inn',
    location: 'Phoenix, AZ',
    rating: 4.0,
    price: 150,
    image: require('../Files/Materials/06-Explore Page/pexels-photo-221457 1.png'),
    description: 'Tranquil desert retreat with pool and spa facilities.'
  },
  {
    id: '6',
    name: 'Historic Downtown Hotel',
    location: 'Boston, MA',
    rating: 4.6,
    price: 280,
    image: require('../Files/Materials/06-Explore Page/image-1-3.png'),
    description: 'Elegant historic hotel with modern amenities in downtown Boston.'
  },
];

const Explore = () => {
  const navigation = useNavigation();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'price'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    setTimeout(() => {
      setHotels(sampleHotels);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const sortHotels = (hotelsToSort) => {
    return [...hotelsToSort].sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else {
        return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
    });
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const renderHotelCard = ({ item }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
    >
      <Image source={item.image} style={styles.hotelImage} />
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{item.name}</Text>
        <Text style={styles.hotelLocation}>{item.location}</Text>
        <View style={styles.ratingPriceContainer}>
          <Text style={styles.hotelRating}>⭐ {item.rating}</Text>
          <Text style={styles.hotelPrice}>${item.price}/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const sortedHotels = sortHotels(hotels);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading hotels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Hotels</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'rating' && styles.activeSort]}
          onPress={() => handleSort('rating')}
        >
          <Text style={[styles.sortText, sortBy === 'rating' && styles.activeSortText]}>
            Rating {sortBy === 'rating' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price' && styles.activeSort]}
          onPress={() => handleSort('price')}
        >
          <Text style={[styles.sortText, sortBy === 'price' && styles.activeSortText]}>
            Price {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
          </Text>
        </TouchableOpacity>
      </View>

      {sortedHotels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hotels found</Text>
        </View>
      ) : (
        <FlatList
          data={sortedHotels}
          renderItem={renderHotelCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  signOutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    width: '100%',
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  activeSort: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  sortText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeSortText: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});

export default Explore;
