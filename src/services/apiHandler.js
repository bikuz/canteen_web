const baseURL = 'http://localhost:3000';

// Centralized API handler
export async function apiRequest(endPoint, options = {}) {
    try {
        const response = await fetch(`${baseURL}/${endPoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Error: ${error.message}`);
        throw error; // Re-throw to handle in calling functions if needed
    }
}

// Utility function to create FormData
export function createFormData(item) {
    const formData = new FormData();
    Object.keys(item).forEach((key) => {
        formData.append(key, item[key]);
    });
    return formData;
}

// Get items
export async function getItems({ endPoint, onSuccess, onError, onFinally }) {
    try {
        const items = await apiRequest(endPoint);
        if (typeof onSuccess === 'function') onSuccess(items);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}

// Create an item
export async function createItem(item, { endPoint, onSuccess, onError, onFinally }) {
    try {
        const formData = createFormData(item);
        const newItem = await apiRequest(endPoint, {
            method: 'POST',
            body: formData,
        });
        if (typeof onSuccess === 'function') onSuccess(newItem);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}

// Update an item
export async function updateItem(item, { endPoint, onSuccess, onError, onFinally }) {
    try {
        const formData = createFormData(item);
        const updatedItem = await apiRequest(`${endPoint}/${item.id}`, {
            method: 'PATCH',
            body: formData,
        });
        if (typeof onSuccess === 'function') onSuccess(updatedItem);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}

// Delete an item
export async function deleteItem(id, { endPoint, onSuccess, onError, onFinally }) {
    try {
        const data = await apiRequest(`${endPoint}/${id}`, { method: 'DELETE' });
        if (typeof onSuccess === 'function') onSuccess(data);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}
