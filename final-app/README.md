# Hotel Booking App

A modern React Native mobile application for browsing and booking hotels. Built with Expo, Firebase, and React Navigation.

## Features

### Authentication

- **Sign Up**: Create new user accounts with email and password
- **Sign In**: Secure login with Firebase Authentication
- **Password Reset**: Forgot password functionality
- **Onboarding**: Multi-screen tutorial for first-time users

### Hotel Management

- **Explore Hotels**: Browse a curated list of hotels with images, ratings, and pricing
- **Sort & Filter**: Sort hotels by price or rating (ascending/descending)
- **Hotel Details**: View detailed information about each hotel
- **Weather Information**: See current weather for hotel locations (OpenWeatherMap API)
- **Reviews**: View and add reviews with star ratings

### Booking System

- **Book Hotels**: Select check-in/check-out dates and number of rooms
- **Date Picker**: Easy date selection using native date picker
- **Cost Calculation**: Automatic total cost calculation based on dates and rooms
- **Booking Confirmation**: Review and confirm bookings before submission
- **My Bookings**: View all your confirmed bookings in the Profile screen

### Additional Features

- **Special Deals**: Browse special hotel deals from Fake Store API
- **Profile Management**: Edit your name and view booking history
- **Firebase Integration**: Real-time data synchronization
- **Offline Support**: Authentication state persistence

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Firebase Account** (for backend services)
- **OpenWeatherMap API Key** (for weather features)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd final-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Install Expo CLI globally** (if not already installed)
   ```bash
   npm install -g expo-cli
   ```

## Configuration

### Firebase Setup

1. **Create a Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable **Email/Password Authentication**
   - Enable **Cloud Firestore Database**

2. **Get Firebase Configuration**

   - In Firebase Console, go to Project Settings → General
   - Scroll down to "Your apps" section
   - Select Web app or add a new Web app
   - Copy the Firebase configuration object

3. **Update Firebase Config**

   - Open `firebaseConfig.js`
   - Replace the existing configuration with your Firebase config:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID",
   };
   ```

4. **Set Firestore Security Rules**

   - Go to Firebase Console → Firestore Database → Rules
   - Update rules to:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /bookings/{bookingId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && request.auth.uid == resource.data.userId;
       }
       match /reviews/{reviewId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```

5. **Create Firestore Index** (if needed)
   - Firebase will prompt you when you first use reviews with orderBy
   - Or manually create in Firestore → Indexes:
     - Collection: `reviews`
     - Fields: `hotelId` (Ascending), `createdAt` (Descending)

### OpenWeatherMap API Setup

1. **Get API Key**

   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key

2. **Update API Key**
   - Open `components/HotelDetails.js`
   - Find the line: `const API_KEY = 'YOUR_OPENWEATHER_API_KEY';`
   - Replace `YOUR_OPENWEATHER_API_KEY` with your actual API key

## Running the App

### Start the Development Server

```bash
npm start
```

or

```bash
expo start
```

### Run on Android

```bash
npm run android
```

or

```bash
expo start --android
```

### Run on iOS

```bash
npm run ios
```

or

```bash
expo start --ios
```

### Run on Web

```bash
npm run web
```

or

```bash
expo start --web
```

### Clear Cache (if experiencing issues)

```bash
npx expo start --clear
```

## Project Structure

```
final-app/
├── components/
│   ├── Booking.js          # Booking screen with date picker
│   ├── Deals.js            # Special deals from Fake Store API
│   ├── Explore.js          # Main hotel listing screen
│   ├── ForgotPassword.js   # Password reset screen
│   ├── HotelDetails.js     # Hotel details with reviews and weather
│   ├── Onboarding.js       # First-time user onboarding
│   ├── Profile.js          # User profile and bookings
│   ├── SignIn.js           # Login screen
│   └── SignUp.js           # Registration screen
├── navigation/
│   ├── AuthStack.js        # Authentication navigation stack
│   └── MainStack.js        # Main app navigation (tabs)
├── Files/
│   └── Materials/          # Images and assets
├── App.js                  # Main app component
├── firebaseConfig.js       # Firebase configuration
├── index.js                # Entry point
└── package.json            # Dependencies
```

## Technologies Used

- **React Native**: Mobile app framework
- **Expo**: Development platform and tooling
- **React Navigation**: Navigation library
- **Firebase Authentication**: User authentication
- **Cloud Firestore**: Database for bookings and reviews
- **OpenWeatherMap API**: Weather data
- **Fake Store API**: Sample data for deals
- **AsyncStorage**: Local data persistence
- **@react-native-community/datetimepicker**: Date selection

## Key Dependencies

```json
{
  "expo": "~54.0.22",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-navigation/native": "^7.1.19",
  "@react-navigation/native-stack": "^7.6.2",
  "@react-navigation/bottom-tabs": "^7.7.3",
  "firebase": "^12.5.0",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-community/datetimepicker": "^8.4.4"
}
```

## Usage Guide

### For First-Time Users

1. Launch the app
2. View onboarding screens (3 screens explaining features)
3. Tap "Get Started"
4. Sign up with email and password
5. Sign in to access the app

### Browsing Hotels

1. Navigate to the **Explore** tab
2. Browse the hotel list
3. Use **Sort** buttons to sort by Rating or Price
4. Tap any hotel card to view details

### Booking a Hotel

1. Open a hotel's detail page
2. Tap **Book Now** button
3. Select check-in and check-out dates
4. Choose number of rooms
5. Review the booking summary
6. Tap **Confirm Booking**
7. View your booking in the **Profile** tab

### Adding Reviews

1. Navigate to a hotel's detail page
2. Scroll to the **Reviews** section
3. Tap **Add Review**
4. Select star rating (1-5)
5. Write your review
6. Tap **Submit**

### Viewing Special Deals

1. Navigate to the **Deals** tab
2. Browse special offers
3. Tap any deal to view details

## Troubleshooting

### App Won't Start

- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Firebase Errors

- Verify Firebase config in `firebaseConfig.js`
- Check Firestore security rules
- Ensure Authentication is enabled in Firebase Console

### Weather Not Showing

- Verify OpenWeatherMap API key in `HotelDetails.js`
- Check internet connection
- API key may need activation time (up to 2 hours)

### Date Picker Issues

- Ensure `@react-native-community/datetimepicker` is installed
- For Android, may require additional native setup

### AsyncStorage Errors

- Clear app data: Settings → Apps → [Your App] → Clear Data
- Or uninstall and reinstall the app

## Important Notes

- **API Keys**: Never commit API keys to version control. Use environment variables in production.
- **Firebase**: This project uses Firestore. Ensure your Firebase project has Firestore enabled.
- **Testing**: Test on both Android and iOS for best compatibility.
- **First Launch**: New users will see onboarding screens. Returning users skip directly to authentication.

## License

This project is for educational purposes.

## Contact

For questions or issues, please contact the development team.

---

**Enjoy booking hotels! 🏨✨**
