// src/routes/routes.js
import { writable } from 'svelte/store';
import { getAccessToken, setTokens, removeTokens, resetInactivityTimer, refreshAccessToken } from '../services/auth';

// Initialize authentication state based on token presence
export const isAuthenticated = writable(false);

// Function to check and update authentication state
export async function checkAuthStatus() {
    const token = getAccessToken();
    if (!token) {
        isAuthenticated.set(false);
        return false;
    }

    try {
        // Try to refresh the token if it exists
        await refreshAccessToken();
        isAuthenticated.set(true);
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        isAuthenticated.set(false);
        removeTokens();
        return false;
    }
}

export function login(access_token, refresh_token, remember = false) {
    setTokens(access_token, refresh_token, remember);
    isAuthenticated.set(true);
    resetInactivityTimer();
}

export function logout() {
    removeTokens();
    isAuthenticated.set(false);
}

// Initialize auth status when the module loads
checkAuthStatus();
