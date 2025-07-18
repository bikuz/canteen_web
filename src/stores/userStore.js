import { writable } from 'svelte/store';

export const user = writable(null);

// You should update this store after successful login with user details
// Example: user.set(userData); 

// In your login handler
const loginSuccess = (userData) => {
    isAuthenticated.set(true);
    user.set(userData); // Set user data in store
    // ... rest of your login logic
};