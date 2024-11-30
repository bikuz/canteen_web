const baseURL = 'http://localhost:3000';

// Centralized API handler
// export async function apiRequest(endPoint, options = {}) {
//     try {
//         const { method = 'GET', headers = {}, body = null } = options;

//         const response = await fetch(`${baseURL}/${endPoint}`, {
//             method,
//             headers: {
//                 'Content-Type': options.contentType || 'application/json', // Default to JSON
//                 ...headers
//             },
//             body,
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || `HTTP Error: ${response.status}`);
//         }

//         return await response.json();
//     } catch (error) {
//         console.error(`API Error: ${error.message}`);
//         throw error; // Re-throw to handle in calling functions if needed
//     }
// }
export async function apiRequest(endPoint, options = {}) {
    try {
        const { method = 'GET', headers = {}, body = null, contentType } = options;

        // For multipart/form-data, we do not need to set Content-Type manually
        if (contentType !== 'multipart/form-data') {
            headers['Content-Type'] = contentType || 'application/json'; // Default to JSON
        }

        const response = await fetch(`${baseURL}/${endPoint}`, {
            method,
            headers: {
                ...headers
            },
            body,
        });

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

// Utility function to create JSON body
export function createJSONBody(item) {
    return JSON.stringify(item);
}

// Utility function to create URL-encoded body
export function createUrlEncodedBody(item) {
    const urlEncoded = new URLSearchParams();
    Object.keys(item).forEach((key) => {
        urlEncoded.append(key, item[key]);
    });
    return urlEncoded.toString();
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
export async function createItem(item, { endPoint, contentType = 'application/json', onSuccess, onError, onFinally }) {
    try {
        let body;
        if (contentType === 'multipart/form-data') {
            body = createFormData(item);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            body = createUrlEncodedBody(item);
        } else {
            body = createJSONBody(item);
        }

        const newItem = await apiRequest(endPoint, {
            method: 'POST',
            body,
            contentType,
        });

        if (typeof onSuccess === 'function') onSuccess(newItem);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}

// Update an item
export async function updateItem(item, { endPoint, contentType = 'application/json', onSuccess, onError, onFinally }) {
    try {
        let body;
        if (contentType === 'multipart/form-data') {
            body = createFormData(item);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            body = createUrlEncodedBody(item);
        } else {
            body = createJSONBody(item);
        }

        const updatedItem = await apiRequest(`${endPoint}/${item.id}`, {
            method: 'PATCH',
            body,
            contentType,
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
