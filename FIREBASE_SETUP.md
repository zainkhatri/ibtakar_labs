# Firebase Setup Instructions

## Project Details
- **Project Name:** ibtakar
- **Project ID:** ibtakar  
- **Project Number:** 59240945977
- **Database URL:** https://ibtakar-default-rtdb.firebaseio.com

## Setup Steps

### 1. Get Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/ibtakar)
2. Click on "Project Settings" (gear icon)
3. Scroll down to "Your apps" section
4. If no web app exists, click "Add app" and select Web (</>) 
5. Copy the config object

### 2. Update Configuration
Update `/src/firebase.js` with your actual values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "ibtakar.firebaseapp.com",
  databaseURL: "https://ibtakar-default-rtdb.firebaseio.com",
  projectId: "ibtakar",
  storageBucket: "ibtakar.appspot.com", 
  messagingSenderId: "59240945977",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

### 3. Database Rules (Security)
In Firebase Console > Realtime Database > Rules, use:

```json
{
  "rules": {
    "reviews": {
      ".read": true,
      ".write": true,
      "$reviewId": {
        ".validate": "newData.hasChildren(['name', 'role', 'company', 'text', 'rating', 'createdAt']) && newData.child('rating').isNumber() && newData.child('rating').val() >= 1 && newData.child('rating').val() <= 5"
      }
    }
  }
}
```

### 4. Environment Variables (Recommended)
For production, use environment variables:

1. Create `.env.local` file:
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

2. Update `firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... other config
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Database Structure
Reviews are stored at `/reviews` with this structure:
```json
{
  "reviews": {
    "uniqueId": {
      "name": "Client Name",
      "role": "Job Title", 
      "company": "Company Name",
      "text": "Review text",
      "rating": 5,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "date": "1/1/2024",
      "approved": true
    }
  }
}
```

## Managing Reviews
- View/edit reviews: [Firebase Console Database](https://console.firebase.google.com/u/0/project/ibtakar/database/ibtakar-default-rtdb/data/~2F)
- Delete inappropriate reviews directly from console
- Export data for backup if needed
