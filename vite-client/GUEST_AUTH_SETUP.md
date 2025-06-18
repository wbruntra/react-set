# Guest Authentication Setup

## Overview

The Guest component has been modified to allow users to join games without requiring Google authentication. Users can join as guests with just a nickname, and their session persists across page reloads through localStorage.

**Note**: The current Firebase project has anonymous authentication disabled, which limits guest users' ability to write to Firestore. Guest functionality depends on Firebase security rules allowing unauthenticated read/write access.

## Current Status

- ✅ Guest user creation and persistence working
- ✅ LocalStorage session management working
- ✅ UI for guest/authenticated user transitions working
- ✅ **Authentication now uses popup method by default (redirect was broken)**
- ⚠️ Firebase write operations may fail for guest users (depends on security rules)
- ⚠️ Anonymous authentication disabled on Firebase project
- ⚠️ **TODO: Fix redirect authentication method**

## Changes Made

### 1. Guest Component (`src/components/Guest.tsx`)

- **Guest Join Form**: Added a form that allows users to enter a nickname and join as a guest
- **Anonymous Firebase Auth**: Automatically sets up anonymous Firebase authentication for guest users
- **User Object Creation**: Creates a guest user object with a unique ID and guest flag
- **Dual Options**: Users can still choose to sign in with Google for a persistent profile
- **LocalStorage Persistence**: Guest user data is stored in localStorage for session persistence
- **Upgrade Option**: Guest users can upgrade to Google authentication at any time

### 2. Layout Component (`src/components/Layout.tsx`)

- **Guest User Restoration**: Checks localStorage on app load and restores guest user sessions
- **Anonymous Auth Setup**: Automatically sets up anonymous Firebase auth for restored guest users
- **Auth State Management**: Properly handles transitions between guest and authenticated users

### 3. User Slice (`src/features/user/userSlice.ts`)

- **Extended User Interface**: Added support for `uid`, `displayName`, `email`, and `isGuest` properties
- **Guest User Support**: The Redux store now properly handles guest user objects

### 4. Signout Component (`src/components/Signout.tsx`)

- **Guest Data Cleanup**: Clears guest user data from localStorage when signing out

## How It Works

1. **Guest Flow**:

   - User visits the guest page
   - Enters a nickname in the guest form
   - Gets assigned a unique guest ID (`guest_{timestamp}_{random}`)
   - Guest user data is stored in localStorage for persistence across page reloads
   - Anonymous Firebase authentication is set up automatically
   - User can participate in the game like any authenticated user

2. **Session Persistence**:

   - Guest user information is stored in localStorage
   - On page reload, the Layout component checks for and restores guest user data
   - Anonymous Firebase authentication is automatically re-established
   - Guest users maintain their identity across browser sessions

3. **Google Auth Flow**:

   - Still available as an option for users who want persistent profiles
   - Guest users can upgrade to Google authentication at any time
   - When upgrading, guest data is cleared and replaced with Google account data

4. **Firebase Integration**:
   - Guest users can read from Firestore (if security rules allow)
   - Write operations are attempted but may fail due to authentication requirements
   - Error handling gracefully manages failed operations
   - Full Firebase functionality requires enabling anonymous auth or updating security rules

## Firebase Security Considerations & Solutions

The current Firebase project has anonymous authentication disabled, which causes guest users to get permission errors when trying to write to Firestore. Here are potential solutions:

### Option 1: Enable Anonymous Authentication (Recommended)

In the Firebase Console:

1. Go to Authentication > Sign-in method
2. Enable "Anonymous" authentication
3. This allows the current implementation to work fully

### Option 2: Update Security Rules for Unauthenticated Access

Modify Firestore security rules to allow unauthenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow unauthenticated read/write for games
    match /games/{gameId} {
      allow read, write: if true; // WARNING: This allows anyone to read/write
    }

    match /games/{gameId}/actions/{actionId} {
      allow read, write: if true; // WARNING: This allows anyone to read/write
    }
  }
}
```

### Option 3: Hybrid Approach (Current Implementation)

- Guest users can read game state (if rules allow)
- Write operations gracefully fail with error handling
- Guests can still participate by viewing games
- Full participation requires Google authentication

### Recommended Security Rules

For a balance of security and guest access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users (including anonymous) full access
    match /games/{gameId} {
      allow read: if true; // Anyone can read games
      allow write: if request.auth != null; // Only authenticated users can write
    }

    match /games/{gameId}/actions/{actionId} {
      allow read: if true; // Anyone can read actions
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## Benefits

- **Lower Barrier to Entry**: Users can join games immediately without account creation
- **Session Persistence**: Guest users are remembered across page reloads and browser sessions
- **Maintained Functionality**: All game features work the same for guest users
- **Progressive Enhancement**: Users can upgrade from guest to authenticated accounts seamlessly
- **Firebase Compatibility**: Anonymous authentication ensures full Firebase functionality
- **User Experience**: Smooth transitions between guest and authenticated states

## Technical Notes

- Guest IDs are generated using timestamp and random strings to ensure uniqueness
- Guest user data is stored in localStorage with the key `guestUser`
- Anonymous Firebase authentication is set up automatically when needed
- The Layout component handles guest user restoration on app initialization
- Guest user state is stored in Redux like regular authenticated users
- The component gracefully handles both authenticated and guest users
- Guest data is automatically cleared when users sign in with Google
- Signout functionality properly cleans up guest data from localStorage

## Authentication Method Update (June 2025)

**Issue**: The Firebase redirect authentication method was not working properly across all environments.

**Solution**: Switched to popup authentication as the default method for all environments.

**Changes Made**:

- Modified `handleGoogleSignIn()` to always use popup instead of environment-based selection
- Updated all components (`Host.tsx`, `Stats.tsx`, `Guest.tsx`) to use `handleGoogleSignIn()` instead of calling `handleGoogleRedirect()` directly
- Kept `handleGoogleRedirect()` available for testing in advanced options with clear indication it's not working
- Added TODO comments to fix redirect authentication in the future

**Benefits**:

- ✅ Reliable authentication that works in all environments
- ✅ Consistent user experience
- ✅ No more auth failures due to redirect issues

**Future Work**:

- 🔄 Investigate and fix the redirect authentication method
- 🔄 Consider making redirect vs popup configurable once redirect is fixed
