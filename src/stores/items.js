
const BASE_URL = 'http://localhost:3000'; 

export async function getCategories() {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
}

export async function getFoodItems() {
    const response = await fetch(`${BASE_URL}/fooditems`);
    if (!response.ok) throw new Error('Failed to fetch food items');
    return response.json();
}

// export async function createFoodItem(data) {
//     const response = await fetch(`${BASE_URL}/fooditems`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
//     if (!response.ok) throw new Error('Failed to create food item');
//     return response.json();
// }

export async function createFoodItem(data) {
    const formData = new FormData();

    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('type', data.type);
    formData.append('image', data.image);

    const response = await fetch(`${BASE_URL}/fooditems`, {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to create food item');
    return response.json();
}
