import { writable } from 'svelte/store';

function getCartKey() {
    // You'll need to implement a way to get the current user's ID
    // This could come from your auth store or session
    const userId = localStorage.getItem('username'); // or however you store the user ID
    return userId ? `cart_${userId}` : 'cart_guest';
}

// Load initial cart data from localStorage with user-specific key
function getStoredCart() {
    const cartKey = getCartKey();
    const storedCart = localStorage.getItem(cartKey);
    return storedCart ? JSON.parse(storedCart) : [];
}

function createCart() {
    const { subscribe, set, update } = writable(getStoredCart());

    return {
        subscribe,
        addItem: (item) => update(items => {
            const existingItem = items.find(i => i._id === item._id);
            let updatedItems;
            
            if (existingItem) {
                updatedItems = items.map(i => 
                    i._id === item._id 
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                updatedItems = [...items, { ...item, quantity: 1 }];
            }
            
            // Save to localStorage with user-specific key
            localStorage.setItem(getCartKey(), JSON.stringify(updatedItems));
            return updatedItems;
        }),
        
        removeItem: (id) => update(items => {
            const updatedItems = items.filter(i => i._id !== id);
            // Save to localStorage with user-specific key
            localStorage.setItem(getCartKey(), JSON.stringify(updatedItems));
            return updatedItems;
        }),
        
        updateQuantity: (id, quantity) => update(items => {
            const updatedItems = items.map(i => 
                i._id === id ? { ...i, quantity } : i
            );
            // Save to localStorage with user-specific key
            localStorage.setItem(getCartKey(), JSON.stringify(updatedItems));
            return updatedItems;
        }),
        
        clearCart: () => {
            // Clear localStorage with user-specific key
            localStorage.removeItem(getCartKey());
            set([]);
        },

        // Add this method to handle user changes
        updateUser: () => {
            // Reload cart data for the new user
            set(getStoredCart());
        }
    };
}

export const cart = createCart();