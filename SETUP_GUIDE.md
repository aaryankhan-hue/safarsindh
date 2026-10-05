# SafarSindh (سفر سنڌ) - Deployment & Setup Guide

**SafarSindh** is a production-ready, mobile-first ride-hailing Progressive Web App (PWA) inspired by **inDrive** and **Yango**, built specifically for the **Naukot – Mithi – Mirpurkhas** corridor of Sindh, Pakistan.

---

## 1. Project Structure

```text
/
├── public/
│   ├── manifest.webmanifest      # PWA Web App Manifest
│   ├── icon-192.svg              # Brand icon
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx           # Fleet control, driver approval & fare matrix
│   │   ├── common/
│   │   │   ├── RideChatModal.tsx            # In-app chat with quick Urdu/Sindhi replies
│   │   │   ├── SetupGuideModal.tsx          # In-app documentation
│   │   │   ├── SosModal.tsx                 # Emergency 15 & SMS broadcast
│   │   │   └── TopNavigation.tsx            # Role switcher & language selector
│   │   ├── driver/
│   │   │   ├── DriverDashboard.tsx          # Radar, accept fare, counter-offer, earnings
│   │   │   └── DriverRegistrationModal.tsx  # Document onboarding & CNIC/license upload
│   │   ├── map/
│   │   │   └── SafarMap.tsx                 # High-definition Sindh regional GIS vector map
│   │   └── passenger/
│   │       ├── ActiveRideView.tsx           # OTP verification, driver card & live status
│   │       ├── DriverOffersSheet.tsx        # inDrive-style negotiation bottom-sheet
│   │       ├── PassengerBookingFlow.tsx     # Route picker, vehicle types, editable offer
│   │       └── PostRideRatingModal.tsx      # Cash receipt & 5-star compliments
│   ├── data/
│   │   ├── fareConfigs.ts                   # Base rates, per-km fees, commission %
│   │   └── sindhLocations.ts                # Real Naukot, Mithi, Mirpurkhas coordinates
│   ├── i18n/
│   │   └── translations.ts                  # English, Urdu (RTL), and Sindhi (RTL)
│   ├── services/
│   │   ├── firebase.ts                      # Firestore SDK connector
│   │   └── store.ts                         # Multi-tab BroadcastChannel & local real-time store
│   ├── types/
│   │   └── index.ts                         # TypeScript domain models
│   ├── App.tsx                              # Main root application
│   ├── index.css                            # Tailwind CSS styling
│   └── main.tsx                             # React 19 entry point
├── firestore.rules                          # Cloud Firestore security rules
├── metadata.json
├── package.json
└── vite.config.ts
```

---

## 2. Environment Variables (.env)

Create a `.env` file in the root directory:

```bash
# Google Maps Platform (Optional: For external Google Maps tiles & Geocoding)
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"

# Firebase Cloud Firestore (Optional: Connects to your live Firebase backend)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="safarsindh.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="safarsindh"
VITE_FIREBASE_STORAGE_BUCKET="safarsindh.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

*Note: Even without any API keys, SafarSindh runs completely out of the box using its built-in Sindh Regional Vector Cartographic Engine and multi-tab reactive store!*

---

## 3. Firestore Database Schema

### `rides/{rideId}`
```json
{
  "id": "ride-xyz123",
  "passengerId": "usr-456",
  "passengerName": "Aaryan Khan",
  "passengerPhone": "+92 300 1234567",
  "passengerRating": 4.9,
  "pickup": {
    "name": "Naukot Fort",
    "city": "Naukot",
    "lat": 24.8583,
    "lng": 69.2045
  },
  "dropoff": {
    "name": "Gaddi Bhit Sand Dunes",
    "city": "Mithi",
    "lat": 24.7438,
    "lng": 69.8012
  },
  "distanceKm": 48.0,
  "vehicleType": "car_economy",
  "baseRecommendedFare": 750,
  "passengerOffer": 800,
  "finalFare": 800,
  "status": "driver_arriving",
  "otp": "4921",
  "paymentMethod": "cash",
  "paymentStatus": "unpaid",
  "isWomenOnly": false,
  "offers": [
    {
      "id": "off-1",
      "driverId": "drv-mithi-1",
      "driverName": "Zulfiqar Ali",
      "offeredPrice": 800,
      "etaMinutes": 4
    }
  ],
  "createdAt": 1728000000000,
  "updatedAt": 1728000005000
}
```

### `drivers/{driverId}`
```json
{
  "id": "drv-naukot-1",
  "userId": "usr-drv-1",
  "name": "Ali Raza Soomro",
  "phone": "+92 300 2345678",
  "cnic": "44101-1234567-1",
  "licenseNumber": "SINDH-MPK-88219",
  "vehicleType": "bike",
  "vehicleModel": "Honda CG 125 Red",
  "vehicleNumberPlate": "MPK-7812",
  "status": "approved",
  "isOnline": true,
  "currentCity": "Naukot",
  "currentLocation": { "lat": 24.8600, "lng": 69.2060 },
  "rating": 4.9,
  "totalTrips": 342,
  "balancePKR": 4200
}
```

---

## 4. How to Test the inDrive Negotiation Flow

1. **Solo Test Mode**:
   - Open the app in **Passenger** mode.
   - Choose a popular route (e.g. *Naukot Fort → Mithi Gaddi Bhit*).
   - Adjust your offer (e.g. 750 PKR) and tap **Find Drivers**.
   - Within 2 to 4 seconds, simulated regional drivers (e.g., Zulfiqar Ali or Ghulam Murtaza) will submit offers directly matching or counter-offering.
   - Tap **Accept Offer** to start the trip!

2. **Real-time 2-Browser Test**:
   - Open Window A: set role to **Passenger**.
   - Open Window B: set role to **Driver**.
   - Window A posts a ride request.
   - Window B immediately hears the alert and sees the request card with the passenger's offered fare.
   - In Window B, tap either **Accept Fare** or click **+50 PKR** to counter-offer.
   - Window A receives the driver's offer in real-time without refreshing!

3. **Admin Test**:
   - Switch role to **Admin Dashboard**.
   - Approve or reject driver registrations, adjust the per-km pricing matrix, and broadcast regional notifications.
