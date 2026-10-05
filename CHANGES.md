# SafarSindh (سفر سنڌ) - Changelog & Demo Logins

## 1. Demo Logins

The application includes 3 pre-seeded demo accounts that can be accessed either via the quick-login buttons on `AuthScreen` or by entering credentials manually:

| Role | Mobile Number | Password | Account Details |
| :--- | :--- | :--- | :--- |
| **Passenger** | `0300 1234567` (or `+923001234567`) | `123456` | Aaryan Khan (Naukot resident, rating 4.9) |
| **Driver** | `0300 2345678` (or `+923002345678`) | `123456` | Ali Raza Soomro (Honda CG 125, MPK-7812, Naukot) |
| **Admin** | `0300 0000000` (or `+923000000000`) | `admin123` | SafarSindh Regional Operations Admin |

---

## 2. Summary of Changes

### STEP 1: Authentication (Login / Sign Up)
- **`src/services/auth.ts`**:
  - Implemented phone number normalization (`normalizePhone`) supporting `03001234567`, `0300 1234567`, `+92 300 1234567` -> `+923001234567`.
  - Generic authentication methods: `logIn`, `signUp`, `updateProfile`, `logOut`, `getSession`, `generateOtp`, `verifyOtp`.
  - SHA-256 password hashing with fallback when `crypto.subtle` is unavailable.
  - Automatically seeds demo accounts with encrypted password hashes.
  - Enforced security rule preventing admin creation from public sign up.
- **`src/i18n/authText.ts`**:
  - Comprehensive translations in **English**, **Urdu (اردو)**, and **Sindhi (سنڌي)** for labels, OTP steps, and error conditions.
- **`src/components/auth/AuthScreen.tsx`**:
  - Mobile-first auth screen with green gradient hero, Login/Sign Up tabs, show/hide password toggle, and Passenger/Driver role selection.
  - 6-digit OTP verification with on-screen demo code indicator.
  - 1-click quick-login buttons for Passenger, Driver, and Admin.
- **`src/App.tsx`**:
  - Enforced session gating (unauthenticated users see `AuthScreen`).
  - Removed arbitrary top role switcher: authenticated accounts only see their own respective interface.
  - Persistent language selection in `localStorage` with `dir="rtl"` applied for Urdu and Sindhi.

### STEP 2: Mobile-Friendly Layout & PWA Compliance
- **`src/components/common/TopNavigation.tsx`**:
  - Replaced bulky role switcher bar with a compact **56px header** displaying brand logo, app name, logged-in user name, role badge, language switcher, help guide, and logout button.
  - Safe-area insets respected (`env(safe-area-inset-top)`).
- **Root Layout**:
  - Configured `h-[100dvh]` root with viewport containment and scrollable content views.
- **Passenger Bottom Navigation**:
  - **`src/components/common/BottomNav.tsx`**: 3-tab navigation (**Home**, **My Rides**, **Profile**) with active indicators, live ride notification ping, and bottom safe-area insets.
- **Booking Flow UX**:
  - **`PassengerBookingFlow.tsx`**: Mobile drag handle, 48px touch-target steppers (`-20` / `+20` PKR), and sticky bottom **"Find Drivers (Rs. X)"** button.
- **Touch Support for Map**:
  - **`src/components/map/SafarMap.tsx`**: Added touch drag handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`, `onTouchCancel`), `touch-action: none`, and mouse-leave drag cancellation.
- **Viewport Accessibility**:
  - **`index.html`**: Removed `maximum-scale=1.0, user-scalable=no` while preserving `viewport-fit=cover` and added `<link rel="icon">`.
- **CSS Enhancements**:
  - **`src/index.css`**: Minimum 16px font on mobile inputs to prevent iOS auto-zoom, `-webkit-tap-highlight-color: transparent`, and `.no-scrollbar` utility.
  - Applied logical CSS properties (`ps-`, `pe-`, `start-`, `end-`, `rtl:rotate-180`) for natural RTL rendering.

### STEP 3: Ride Booking & Cancellation Flow
- **`src/components/common/CancelRideModal.tsx`**:
  - Bottom-sheet cancellation dialog with radio options (Changed my mind, Found another transport, Driver taking too long, Wrong location, Price too high, Other).
  - Dynamic warning banners differing based on whether a driver has already been assigned.
- **Cancellation Enforcement**:
  - Cancel allowed during `requested`, `offers_received`, `driver_arriving`, and `arrived`.
  - Locked during `ride_started`, `completed`, and `cancelled`.
  - Added visible "Cancel" button in `ActiveRideView`.
  - Added guard in `store.cancelRide` returning `false` once trip has started.
  - Driver cancellation notice: *"The driver cancelled your ride. Please book again."*
- **`src/components/passenger/RideHistory.tsx`**:
  - Displays passenger ride history sorted newest first with status badges, city-to-city route, distance, fare in PKR, date, driver details, cancellation reason/actor, star rating, and "View current ride" button.
- **`src/components/passenger/ProfileScreen.tsx`**:
  - Avatar initial, user details, completed trip counter, editable SOS emergency contact, language selector, setup guide, and logout with confirmation.
- **`src/i18n/appText.ts`**:
  - Multi-language strings for navigation, cancel reasons, history, and profile screens in English, Urdu, and Sindhi.

### STEP 4: Bug Fixes & Refactoring
1. **Rating Popup**:
   - Fixed rating modal flash/invisibility by introducing `store.getPendingRatingRide(passengerId)`.
2. **Skip Rating**:
   - Fixed silent 5-star rating on skip. Skipping now registers `stars: 0` and ride history shows "Not rated".
3. **Hard-coded Passenger ID**:
   - Replaced hard-coded `current_passenger` with real logged-in `user.id`, `user.name`, and `user.phone`.
   - Added `store.getRidesForPassenger(passengerId)`.
4. **Pending Driver Approval Guard**:
   - Blocked online toggle in `DriverDashboard` when `driver.status !== 'approved'`.
   - Hidden incoming ride radar until admin verifies documents.
   - Displayed translated "Pending Admin Approval" notice banner.
5. **Driver Persona Dropdown & Registration**:
   - Hidden persona switcher for authenticated drivers; bound dashboard directly to `driver.userId === user.id`.
   - Rendered "Complete Driver Registration" screen if a driver user has no vehicle profile yet.
   - Pre-populated registration form with user's real name and phone.
6. **Decoupled LocalStorage Write**:
   - Created `store.declineOffer(rideId, offerId)` method replacing direct localStorage write in `App.tsx`.
7. **Cleaned Dependencies & Manifest**:
   - Removed unused `@google/genai`, `express`, `dotenv`, and `@types/express`.
   - Pointed `manifest.webmanifest` to existing SVG icons (`/icon-192.svg`, `/icon-512.svg`).
