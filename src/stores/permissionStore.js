import { writable } from 'svelte/store';

export const userPermissions = writable([]); 
export const userRoles = writable([]);