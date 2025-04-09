// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
function initFirebase() {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    const functions = firebase.functions();
    
    // Firebase auth state observer
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.uid);
            updateUserProfile(user);
            loadUserData(user.uid);
        } else {
            // User is signed out
            console.log('User is signed out');
            // Redirect to login or show login modal
        }
    });
    
    // Enable offline persistence
    db.enablePersistence()
        .catch(err => {
            if (err.code == 'failed-precondition') {
                console.log('Offline persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.log('The current browser does not support offline persistence.');
            }
        });
}

function updateUserProfile(user) {
    const profilePic = document.querySelector('.profile-pic');
    const username = document.querySelector('.username');
    const userMood = document.querySelector('.user-mood');
    
    if (user.displayName) {
        username.textContent = user.displayName;
        profilePic.textContent = user.displayName.charAt(0).toUpperCase();
    } else {
        username.textContent = user.email;
        profilePic.textContent = user.email.charAt(0).toUpperCase();
    }
    
    // Get user's current mood from Firestore
    firebase.firestore().collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (data.currentMood) {
                    userMood.textContent = `Feeling ${data.currentMood}`;
                }
            }
        });
}

function loadUserData(userId) {
    // Load journal entries
    firebase.firestore().collection('users').doc(userId).collection('journal')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            const entriesList = document.getElementById('entries-list');
            entriesList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const entry = doc.data();
                const entryItem = document.createElement('div');
                entryItem.className = 'entry-item';
                entryItem.innerHTML = `
                    <div class="entry-item-header">
                        <div class="entry-item-title">${entry.title || 'Untitled Entry'}</div>
                        <div class="entry-item-date">${new Date(entry.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div class="entry-item-preview">${entry.content.substring(0, 100)}...</div>
                    <div class="entry-item-mood">
                        <i class="fas fa-smile"></i> ${entry.primaryEmotion || 'No analysis'}
                    </div>
                `;
                entriesList.appendChild(entryItem);
            });
        });
    
    // Load mood data for dashboard
    // This would be implemented in dashboard.js
}