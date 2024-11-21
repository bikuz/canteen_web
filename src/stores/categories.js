import { writable } from 'svelte/store';

export const categories = writable([]);

const apiEndpoint = 'http://localhost:3000/categories'; 

// Centralized API handler
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }
        return response.json();
    } catch (error) {
        console.error(error.message);
        throw error; // Re-throw to handle in calling functions if needed
    }
}

// Fetch all categories
export async function fetchCategories() {
    isLoading.set(true);
    try {
        const data = await apiRequest(apiEndpoint);
        categories.set(data);
    } catch (error) {
        alert(`Error fetching categories: ${error.message}`);
    } finally {
        isLoading.set(false);
    }
}

// Create a new category
export async function createCategory(category) {
    isLoading.set(true);
    try {
        const formData = new FormData();
        Object.keys(category).forEach((key) => formData.append(key, category[key]));

        const newCategory = await apiRequest(apiEndpoint, {
            method: 'POST',
            body: formData,
        });
        categories.update((current) => [...current, newCategory]);
    } catch (error) {
        alert(`Error creating category: ${error.message}`);
    } finally {
        isLoading.set(false);
    }
}

// Update a category
export async function updateCategory(id, updatedCategory) {
    isLoading.set(true);
    try {
        const formData = new FormData();
        Object.keys(updatedCategory).forEach((key) => formData.append(key, updatedCategory[key]));

        await apiRequest(`${apiEndpoint}/${id}`, {
            method: 'PATCH',
            body: formData,
        });
        fetchCategories(); // Refresh the categories
    } catch (error) {
        alert(`Error updating category: ${error.message}`);
    } finally {
        isLoading.set(false);
    }
}

// Delete a category
export async function deleteCategory(id) {
    isLoading.set(true);
    try {
        await apiRequest(`${apiEndpoint}/${id}`, { method: 'DELETE' });
        fetchCategories(); // Refresh the categories
    } catch (error) {
        alert(`Error deleting category: ${error.message}`);
    } finally {
        isLoading.set(false);
    }
}
