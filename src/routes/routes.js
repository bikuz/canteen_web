// src/routes/routes.js
import { writable } from 'svelte/store';
import { getToken, setToken, removeToken } from '../services/auth';

export const isAuthenticated = writable(!!getToken());

export function login(token) {
  setToken(token);
  isAuthenticated.set(true);
}

export function logout() {
  removeToken();
  isAuthenticated.set(false);
}
