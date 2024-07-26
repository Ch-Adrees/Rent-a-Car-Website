import { db, auth,doc, getDoc, getDocs, collection, onAuthStateChanged, signOut, where } from './firebase_config.js';

// Function to get the current user from localStorage
export function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}


// Function to save the user to localStorage
function saveCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

export function authenticateUser() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, user => {
            if (user) {
                resolve({
                    email: user.email,
                    name: user.displayName || 'Anonymous'
                });
            } else {
                reject(new Error('No user is signed in'));
            }
        });
    });
}

// Function to get user profile
export const getUserProfile = async (uid) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
};

// Function to logout user
export const logoutUser = async () => {
    await signOut(auth);
};

// Function to initialize auth state listener
export const initAuthStateListener = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userProfile = await getUserProfile(user.uid);
            updateUserUI(userProfile);
        } else {
            updateUserUI(null);
        }
    });
};

// Function to update user interface based on user profile
const updateUserUI = (userProfile) => {
    const userNameElem = document.getElementById('user-name');
    const userEmailElem = document.getElementById('user-email-dropdown');
    const signOutButton = document.getElementById('sign-out');

    if (userProfile) {
        userNameElem.textContent = userProfile.name;
        userEmailElem.textContent = userProfile.email;
        signOutButton.style.display = 'block';
    } else {
        userNameElem.textContent = '';
        userEmailElem.textContent = '';
        signOutButton.style.display = 'none';
    }
};

// Initialize auth state listener when DOM content is loaded
document.addEventListener('DOMContentLoaded', (event) => {
    initAuthStateListener();
});

// Check auth state and redirect if not logged in
export function checkAuthState() {
    const user = getCurrentUser();
    if (!user || !user.isLoggedIn) {
        window.location.href = 'login.html'; // Redirect to sign-in page if not logged in
    }
}


// Ensure the user can't navigate back to the login screen
window.onpopstate = function(event) {
    if (window.location.pathname !== '/homepage.html') {
        window.location.href = 'homepage.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    initAuthStateListener();
});

export async function getUserReservations(uid) {
    try {
        const reservations = [];
        const snaps = await collection(db,`users/${uid}/reservations`);
    const snapshot = await getDocs(snaps);
        snapshot.forEach(doc => {
            reservations.push(doc.data());
        });
        return reservations;
    } catch (error) {
        console.error("Error getting reservations: ", error);
        throw error;
    }
}

