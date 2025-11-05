# Online Leaderboard Setup

The game now supports both local and online leaderboards! By default, it uses localStorage for offline play, but you can easily enable an online leaderboard that updates in real-time across all players.

## Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "il-tempo-gigante" (or any name you prefer)
4. Disable Google Analytics (not needed for this)
5. Click "Create project"

### 2. Set Up Realtime Database
1. In your Firebase project, go to "Realtime Database"
2. Click "Create Database"
3. Choose your location (closest to your players)
4. Select "Start in test mode" (for now)
5. Click "Done"

### 3. Get Your Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" app icon (</>)
4. Register your app with any nickname
5. Copy the `firebaseConfig` object

### 4. Update Configuration File
1. Open `firebase-config.js` in your game folder
2. Replace the placeholder values with your actual Firebase config
3. Save the file

### 5. Deploy and Test
1. Upload your game files to any web server
2. Open the game in a browser
3. Check the browser console - you should see "✅ Firebase initialized successfully"
4. Play a game and finish it
5. Your score will appear in the online leaderboard!

## Features

✅ **Real-time updates** - Scores appear instantly across all players  
✅ **Player name and car displayed** - Shows who played with which car  
✅ **Automatic fallback** - Uses localStorage if Firebase is unavailable  
✅ **Top 10 scores** - Shows the best performances  
✅ **Timestamps** - Records when each score was achieved  

## Security (Optional)

For production use, you should secure your database:

1. Go to Firebase Console > Realtime Database > Rules
2. Replace the rules with:
```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      "$scoreId": {
        ".validate": "newData.hasChildren(['name', 'score', 'car', 'timestamp']) && newData.child('score').isNumber()"
      }
    }
  }
}
```

This allows anyone to read/write scores but validates the data structure.

## Troubleshooting

**Problem**: Console shows "Firebase config not found"  
**Solution**: Make sure `firebase-config.js` is loaded and has valid settings

**Problem**: Console shows "Firebase initialization failed"  
**Solution**: Check your internet connection and Firebase config values

**Problem**: Scores not appearing  
**Solution**: Check browser console for errors, ensure database rules allow writes

## Free Tier Limits

Firebase free tier includes:
- 100 simultaneous connections
- 1GB stored data
- 10GB/month transferred data

This is plenty for most indie games!