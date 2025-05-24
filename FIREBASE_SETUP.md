# Firebase Setup Guide for SabbathScribe

This guide will help you set up Firebase Authentication and Firestore for your SabbathScribe application.

## Prerequisites

1. A Firebase project (you mentioned you already have this set up)
2. Node.js and npm installed
3. Firebase CLI installed globally: `npm install -g firebase-tools`

## Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase configuration values from your Firebase console:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firebase Console Setup

### 1. Enable Authentication

1. Go to your Firebase console → Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password** authentication
5. Enable **Google** authentication (add your domain to authorized domains)

### 2. Create Firestore Database

1. Go to Firestore Database in your Firebase console
2. Click "Create database"
3. Choose "Start in test mode" (we'll update security rules later)
4. Select your preferred region

### 3. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

## Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/auth` to test authentication
3. Sign up with email/password or Google
4. Access `/admin` to test protected routes
5. Try adding people and assignments to test Firestore operations

## Data Structure

The app creates these Firestore collections:

- **people**: Church members with contact info and role preferences
- **assignments**: Role assignments for specific dates
- **roles**: Available church roles (auto-initialized)

## Security Notes

- The current Firestore rules require authentication for all operations
- For production, consider implementing more granular role-based access
- Never commit your `.env.local` file to version control
- Consider implementing user roles (admin, member, etc.) for better security

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console → Authentication → Settings

2. **"Missing or insufficient permissions"**
   - Check that Firestore rules are deployed correctly
   - Ensure user is authenticated before accessing data

3. **Environment variables not loading**
   - Restart your development server after adding .env.local
   - Ensure variables start with `NEXT_PUBLIC_`

## Production Considerations

1. Update Firestore security rules for production use
2. Set up proper error monitoring (Sentry, etc.)
3. Configure Firebase hosting if desired
4. Set up backup strategies for Firestore data
5. Implement role-based access control

For more detailed Firebase documentation, visit: https://firebase.google.com/docs