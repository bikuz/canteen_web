import { writable } from 'svelte/store';

export const categories = writable([]);
export const isLoading = writable(false); // For loading state

const apiEndpoint = 'http://localhost:3000/categories'; 

// Fetch all categories from the backend
export async function fetchCategories() {
    isLoading.set(true);
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        categories.set(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
    } finally {
        isLoading.set(false);
    }
}

// Create a new category
export async function createCategory(category) {
    isLoading.set(true);
    try {
        const formData = new FormData();
        // Assuming `category` is an object with keys `name` and `image`
        for (const key in category) {
            formData.append(key, category[key]);
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            body: formData // Set formData as the request body
        });

        if (response.ok) {
            const newCategory = await response.json(); // Assuming new category data is returned
            categories.update((currentCategories) => [...currentCategories, newCategory]);
        } else {
            throw new Error('Failed to create category');
        }
    } catch (error) {
        console.error('Error creating category:', error);
    } finally {
        isLoading.set(false);
    }
}


// Update an existing category
export async function updateCategory(id, updatedCategory) {
    isLoading.set(true);
    try {
        const formData = new FormData();
        for (const key in updatedCategory) {
            formData.append(key, updatedCategory[key]);
        }

        const response = await fetch(`${apiEndpoint}/${id}`, {
            method: 'PATCH',
            body: formData //ok
        });
        if (response.ok) {
            fetchCategories();
        } else {
            throw new Error('Failed to update category');
        }
    } catch (error) {
        console.error('Error updating category:', error);
    } finally {
        isLoading.set(false);
    }
}

// Delete a category
export async function deleteCategory(id) {
    isLoading.set(true);
    try {
        const response = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchCategories();
        } else {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
    } finally {
        isLoading.set(false);
    }
}
