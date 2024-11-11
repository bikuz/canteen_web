import { writable } from 'svelte/store';

export const categories = writable([]);

const apiEndpoint = 'http://localhost:3000/categories'; 

// Fetch all categories from the backend
export async function fetchCategories() {
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    categories.set(data);
}

// Create a new category
export async function createCategory(category) {
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
    if (response.ok) fetchCategories();
}

// Update an existing category
export async function updateCategory(id, updatedCategory) {
    const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategory)
    });
    if (response.ok) fetchCategories();
}

// Delete a category
export async function deleteCategory(id) {
    const response = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
    if (response.ok) fetchCategories();
}
