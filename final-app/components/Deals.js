import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Deals = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://fakestoreapi.com/products?limit=10');
      
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }
      
      const data = await response.json();
      const deals = data.map((product, index) => ({
        id: product.id.toString(),
        name: product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title,
        location: product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Special Offer',
        rating: (product.rating?.rate || 4.0).toFixed(1),
        price: Math.round(product.price * 10),
        image: { uri: product.image },
        description: product.description || 'Amazing deal!',
        originalProduct: product,
      }));
      
      setProducts(deals);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals. Please try again later.');
      Alert.alert('Error', 'Could not load deals. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderDealCard = ({ item }) => (
    <TouchableOpacity
      style={styles.dealCard}
      onPress={() => {
        navigation.navigate('HotelDetails', { hotel: item });
      }}
    >
      <Image source={item.image} style={styles.dealImage} />
      <View style={styles.dealInfo}>
        <Text style={styles.dealName}>{item.name}</Text>
        <Text style={styles.dealLocation}>{item.location}</Text>
        <View style={styles.ratingPriceContainer}>
          <Text style={styles.dealRating}>⭐ {item.rating}</Text>
          <Text style={styles.dealPrice}>${item.price}/night</Text>
        </View>
        <Text style={styles.dealBadge}>🔥 Special Deal</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading amazing deals...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDeals}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔥 Special Deals</Text>
        <Text style={styles.subtitle}>Hot deals from our partners</Text>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No deals available at the moment</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderDealCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchDeals}
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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
  },
  dealCard: {
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
  dealImage: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    backgroundColor: '#f8f9fa',
  },
  dealInfo: {
    padding: 16,
  },
  dealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dealLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  dealPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  dealBadge: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: 'bold',
    marginTop: 4,
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

export default Deals;
