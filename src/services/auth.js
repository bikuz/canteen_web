// src/services/auth.js
// import axios from 'axios';
import { config } from '../../app.config';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 5 minutes for activity tracking
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000; // 1 minute warning
const TOKEN_REFRESH_THRESHOLD = 1 * 60 * 1000; // Refresh 5 minutes before token expires
let inactivityTimer;
let tokenRefreshTimer;

// Utility function to decode JWT token
function decodeToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Function to schedule token refresh
function scheduleTokenRefresh(token) {
    if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.exp) {
        return;
    }

    const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
    const timeUntilExpiry = expiryTime - Date.now();
    const refreshTime = Math.min(
        timeUntilExpiry - TOKEN_REFRESH_THRESHOLD, // 5 minutes before expiry
        TOKEN_REFRESH_THRESHOLD // Or every 5 minutes, whichever is sooner
    );

    if (refreshTime > 0) {
        tokenRefreshTimer = setTimeout(async () => {
            try {
                // Only attempt refresh if user is active
                if (document.hasFocus()) {
                    const newToken = await refreshAccessToken();
                    if (newToken) {
                        // Schedule next refresh
                        scheduleTokenRefresh(newToken);
                    }
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                removeTokens();
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
        }, refreshTime);
    }
}

// Function to reset the inactivity timer
export function resetInactivityTimer() {
  // Skip inactivity tracking for remembered users
  if (localStorage.getItem('access_token')) {
    return;
}

  if (inactivityTimer) {
      clearTimeout(inactivityTimer);
  }

  // // Warning timer for user inactivity
  // setTimeout(() => {
  //     if (getAccessToken()) {
  //         window.dispatchEvent(new CustomEvent('session-warning'));
  //     }
  // }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT);

  // Just reset the inactivity tracking
  inactivityTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('user-inactive'));
  }, INACTIVITY_TIMEOUT);
}

// Modify setToken to initialize the timer
export function setTokens(access_token, refresh_token, remember = false) {
    if (remember) {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
    } else {
        sessionStorage.setItem('access_token', access_token);
        sessionStorage.setItem('refresh_token', refresh_token);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
    
    // Schedule token refresh
    scheduleTokenRefresh(access_token);
    resetInactivityTimer();
}

export function removeTokens() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
    }
}

// Function to get access token with cross-tab support
export function getAccessToken() {
    // Try sessionStorage first for non-remembered sessions
    const sessionToken = sessionStorage.getItem('access_token');
    if (sessionToken) {
        return sessionToken;
    }
    
    // Fall back to localStorage for remembered sessions
    return localStorage.getItem('access_token');
}

// Function to get refresh token with cross-tab support
export function getRefreshToken() {
    // Try sessionStorage first for non-remembered sessions
    const sessionToken = sessionStorage.getItem('refresh_token');
    if (sessionToken) {
        return sessionToken;
    }
    
    // Fall back to localStorage for remembered sessions
    return localStorage.getItem('refresh_token');
}

// Initialize event listeners
if (typeof window !== 'undefined') {
    // Listen for user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        window.addEventListener(event, () => {
            // if (getAccessToken()) {
            //     resetInactivityTimer();
            // }

            // Only track activity for non-remembered sessions
            const token = getAccessToken();
            if (token && !localStorage.getItem('access_token')) {
                resetInactivityTimer();
            }
        });
    });

    // Handle user inactivity
    window.addEventListener('user-inactive', () => {
        // const accessToken = getAccessToken();
        // if (accessToken) {
        //     removeTokens();
        //     window.dispatchEvent(new CustomEvent('session-expired'));
        // }

        // Only handle inactivity for non-remembered sessions
        const sessionToken = sessionStorage.getItem('access_token');
        if (sessionToken) {
            removeTokens();
            window.dispatchEvent(new CustomEvent('session-expired'));
        }
    });

    // // Add session warning handler
    // window.addEventListener('session-warning', () => {
    //     const stay = confirm('Your session will expire in 1 minute. Do you want to stay logged in?');
    //     if (stay) {
    //         resetInactivityTimer();
    //     }
    // });

    // Handle storage changes for cross-tab synchronization
    window.addEventListener('storage', (event) => {
        if (event.key === 'access_token') {
            const newToken = event.newValue;
            if (newToken) {
                // Reset timers with the new token
                setTokens(newToken, getRefreshToken(), !!localStorage.getItem('refresh_token'));
            } else {
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
        }
    });
}

// Function to refresh the token
export async function refreshAccessToken() {
    const refresh_token = getRefreshToken();
    
    if (!refresh_token) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${config.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token }),
        });

        if (!response.ok) {
            removeTokens();
            throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const wasRemembered = !!localStorage.getItem('refresh_token');
        setTokens(data.access_token, data.refresh_token, wasRemembered);
        
        return data.access_token;
    } catch (error) {
        removeTokens();
        throw error;
    }
}


