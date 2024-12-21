import { getAccessToken } from './auth';
import {config } from '../../app.config';

const baseURL = config.baseURL;


export async function apiRequest(endPoint, options = {}) {
    try {
        const { method = 'GET', headers = {}, body = null, contentType } = options;

        // Get the access token
        const accessToken = getAccessToken();
        
        // For multipart/form-data, we do not need to set Content-Type manually
        if (contentType !== 'multipart/form-data') {
            headers['Content-Type'] = contentType || 'application/json';
        }

        // Add Authorization header if token exists
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
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
        throw error;
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

export async function postItems(items,{ endPoint, onSuccess, onError, onFinally, contentType = 'application/json' }) {
    try {
        let body;
        if (contentType === 'multipart/form-data') {
            body = createFormData(items);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            body = createUrlEncodedBody(items);
        } else {
            body = createJSONBody(items);
        }

        const newitems = await apiRequest(endPoint, {
             method: 'POST', 
             body, 
             contentType
         });

        if (typeof onSuccess === 'function') onSuccess(newitems);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}


// Create an item
export async function createItem(item, { endPoint, onSuccess, onError, onFinally, contentType = 'application/json' }) {
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

// Update an item
export async function patchItem(item, { endPoint, contentType = 'application/json', onSuccess, onError, onFinally }) {
    try {
        let body;
        if (contentType === 'multipart/form-data') {
            body = createFormData(item);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            body = createUrlEncodedBody(item);
        } else {
            body = createJSONBody(item);
        }

        const updatedItem = await apiRequest(endPoint, {
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
        const data = await apiRequest(`${endPoint}/${id}`,
             { method: 'DELETE' });
        if (typeof onSuccess === 'function') onSuccess(data);
    } catch (error) {
        if (typeof onError === 'function') onError(error);
    } finally {
        if (typeof onFinally === 'function') onFinally();
    }
}
