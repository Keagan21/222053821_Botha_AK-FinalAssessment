import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';

const HotelDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { hotel } = route.params;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews from Firestore with real-time listener
  useEffect(() => {
    const reviewsRef = collection(db, 'reviews');
    // Try with orderBy first, fallback to just where if index doesn't exist
    const q = query(
      reviewsRef,
      where('hotelId', '==', hotel.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviewsData = [];
        snapshot.forEach((doc) => {
          reviewsData.push({ id: doc.id, ...doc.data() });
        });
        // Sort by createdAt in JavaScript if needed
        reviewsData.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            const aTime = a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
            return bTime - aTime;
          }
          return 0;
        });
        setReviews(reviewsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
        // Fallback: try without orderBy
        if (error.code === 'failed-precondition') {
          const fallbackQuery = query(
            reviewsRef,
            where('hotelId', '==', hotel.id)
          );
          onSnapshot(
            fallbackQuery,
            (snapshot) => {
              const reviewsData = [];
              snapshot.forEach((doc) => {
                reviewsData.push({ id: doc.id, ...doc.data() });
              });
              reviewsData.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                  const aTime = a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
                  const bTime = b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
                  return bTime - aTime;
                }
                return 0;
              });
              setReviews(reviewsData);
              setLoading(false);
            },
            (fallbackError) => {
              console.error('Fallback query error:', fallbackError);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, [hotel.id]);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        // Extract city from location (e.g., "New York, NY" -> "New York")
        const cityName = hotel.location.split(',')[0].trim();
        const API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // Replace with your API key
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
        });
      } catch (error) {
        console.error('Weather API error:', error);
        setWeatherError('Weather information unavailable');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [hotel.location]);

  const handleAddReview = async () => {
    if (!auth.currentUser) {
      Alert.alert('Authentication Required', 'Please sign in to add a review.');
      return;
    }

    if (newReviewText.trim() === '') {
      Alert.alert('Error', 'Please enter a review text.');
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'reviews'), {
        hotelId: hotel.id,
        hotelName: hotel.name,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: newReviewRating,
        text: newReviewText.trim(),
        createdAt: serverTimestamp(),
      });

      setModalVisible(false);
      setNewReviewText('');
      setNewReviewRating(5);
      Alert.alert('Success', 'Your review has been added!');
    } catch (error) {
      console.error('Error adding review:', error);
      Alert.alert('Error', 'Failed to add review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewUserName}>{item.userName}</Text>
        <Text style={styles.reviewRating}>{'⭐'.repeat(item.rating)}</Text>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
      {item.createdAt && (
        <Text style={styles.reviewDate}>
          {item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recent'}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Image source={hotel.image} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{hotel.name}</Text>
        <Text style={styles.location}>{hotel.location}</Text>
        
        {/* Weather Section */}
        <View style={styles.weatherContainer}>
          {weatherLoading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : weatherError ? (
            <Text style={styles.weatherText}>{weatherError}</Text>
          ) : weather ? (
            <View style={styles.weatherInfo}>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherDescription}>
                {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
              </Text>
              <Text style={styles.weatherCity}>{weather.city}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {hotel.rating}</Text>
        </View>
        <Text style={styles.price}>${hotel.price} per night</Text>
        <Text style={styles.description}>
          {hotel.description || 'A wonderful hotel offering comfortable stays and excellent amenities. Enjoy your stay with us!'}
        </Text>

        {/* Reviews Section */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#007bff" style={styles.loader} />
          ) : reviews.length > 0 ? (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              renderItem={renderReview}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
          )}
          
          {auth.currentUser ? (
            <TouchableOpacity style={styles.addReviewButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addReviewButtonText}>Add Review</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => Alert.alert('Sign In Required', 'Please sign in to add a review.')}
            >
              <Text style={styles.addReviewButtonText}>Sign In to Add Review</Text>
            </TouchableOpacity>
          )}
        </View>

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

      {/* Add Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Your Review</Text>
            <Text style={styles.modalSubtitle}>Rate the hotel:</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNewReviewRating(star)}>
                  <Text style={[styles.star, newReviewRating >= star && styles.starSelected]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Write your review..."
              value={newReviewText}
              onChangeText={setNewReviewText}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleAddReview}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  weatherContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  weatherDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  weatherCity: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  weatherText: {
    fontSize: 14,
    color: '#666',
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
  reviewsContainer: {
    marginBottom: 20,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  loader: {
    marginVertical: 20,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewRating: {
    fontSize: 16,
    color: '#FFD700',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  noReviewsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  addReviewButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    fontSize: 30,
    color: '#ddd',
    marginHorizontal: 5,
  },
  starSelected: {
    color: '#FFD700',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HotelDetails;
