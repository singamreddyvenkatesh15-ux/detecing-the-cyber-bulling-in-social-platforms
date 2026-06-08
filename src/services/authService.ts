import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';

import { app } from "../firebase";
import {
  getFirestore,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";

const db = getFirestore(app);
const auth = getAuth(app);

interface AuthState {
  isAuthenticated: boolean;
  user: any | null; // Firebase User type or null
}

// Initial auth state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null
};

// Current state
let authState = { ...initialState };

// Listeners for auth state changes
const listeners: ((state: AuthState) => void)[] = [];

// Register a listener
function subscribe(listener: (state: AuthState) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

// Notify all listeners
function notifyListeners() {
  listeners.forEach(listener => listener(authState));
}

// Login function using Firebase Authentication
function login(email: string, password: string): Promise<boolean> {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      authState = {
        isAuthenticated: true,
        user
      };

      // Store user info in localStorage (e.g., UID)
      localStorage.setItem('auth', JSON.stringify({ userId: user.uid, email: user.email }));
      notifyListeners();
      toast.success("Logged in successfully");
      return true;
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      toast.error("Invalid email or password");
      return false;
    });
}

// Register function using Firebase Authentication
function register(email: string, password: string, username: string): Promise<boolean> {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      authState = {
        isAuthenticated: true,
        user
      };

      // Store user info in localStorage (e.g., UID and username)
      localStorage.setItem('auth', JSON.stringify({ uid: user.uid, email: user.email, username }));
      notifyListeners();
      toast.success("Account created successfully");
      return true;
    })
    .catch((error) => {
      console.error("Registration error:", error.message);
      toast.error("Failed to create account");
      return false;
    });
}

// Logout function using Firebase Authentication
function logout(): Promise<void> {
  return signOut(auth)
    .then(() => {
      authState = { ...initialState };
      localStorage.removeItem('auth');
      notifyListeners();
      toast.success("Logged out successfully");
    })
    .catch((error) => {
      console.error("Logout error:", error.message);
      toast.error("Failed to log out");
    });
}

// Check if user is authenticated and sync with Firebase auth state
function checkAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    const auth = getAuth(); // Ensure auth is initialized

    // Set up the auth state listener (only once if not already set)
    let isListenerActive = false;
    if (!isListenerActive) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          authState = {
            isAuthenticated: true,
            user
          };
          // Sync localStorage with current user if not set
          const storedAuth = localStorage.getItem('auth');
          if (!storedAuth) {
            localStorage.setItem('auth', JSON.stringify({ uid: user?.uid, email: user.email }));
          }
        } else {
          authState = { ...initialState };
          const storedAuth = localStorage.getItem('auth');
          if (storedAuth) {
            localStorage.removeItem('auth'); // Clear invalid stored auth
          }
        }
        notifyListeners();
        // Resolve with the current state on the first change or initial check
        resolve(authState.isAuthenticated);
      }, (error) => {
        console.error("Auth state check error:", error.message);
        authState = { ...initialState };
        localStorage.removeItem('auth');
        notifyListeners();
        resolve(false); // Resolve with false on error
      });

      // Mark listener as active and store unsubscribe function
      isListenerActive = true;
      // Optionally store unsubscribe to clean up later (e.g., on app unload)
      window.onunload = () => unsubscribe();
    } else {
      // If listener is already active, resolve with current state immediately
      resolve(authState.isAuthenticated);
    }
  });
}

// Get current user
function getCurrentUser(): any | null {
  return authState.user;
}

// Export the auth service
export default {
  login,
  register,
  logout,
  checkAuth,
  getCurrentUser,
  subscribe,
  get state() {
    return authState;
  }
};

