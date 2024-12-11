<script>
    import { cart } from '../../stores/cartStore';
    import { slide, fade } from 'svelte/transition';

    // Add selected items tracking
    let selectedItems = new Set();

    // Calculate total price for selected items only
    $: total = $cart.reduce((sum, item) => 
        selectedItems.has(item._id) ? sum + (item.price * item.quantity) : sum, 0);

    // Toggle item selection
    function toggleSelection(itemId) {
        if (selectedItems.has(itemId)) {
            selectedItems.delete(itemId);
        } else {
            selectedItems.add(itemId);
        }
        selectedItems = selectedItems; // trigger reactivity
    }

    async function placeOrder() {
        if (selectedItems.size === 0) {
            alert('Please select at least one item to order');
            return;
        }

        try {
            const selectedItemsData = $cart.filter(item => selectedItems.has(item._id));
            const orderData = {
                items: selectedItemsData,
                total: total,
                orderDate: new Date().toISOString()
            };
            
            alert('Order placed successfully!');
            // Remove ordered items from cart and localStorage
            selectedItems.forEach(itemId => cart.removeItem(itemId));
            selectedItems.clear();
        } catch (error) {
            alert('Failed to place order. Please try again.');
        }
    }

    function updateQuantity(item, newQuantity) {
        if (newQuantity < 1) {
            cart.removeItem(item._id);
        } else {
            cart.updateQuantity(item._id, newQuantity);
        }
    }
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-xl font-bold mb-2">Shopping Cart</h1>

    {#if $cart.length === 0}
        <div class="text-center py-8 bg-white rounded-lg shadow" transition:fade>
            <p class="text-gray-500">Your cart is empty</p>
        </div>
    {:else}
        <div class="bg-white rounded-lg shadow overflow-auto max-h-[calc(100vh-250px)]">
            <div class="divide-y divide-gray-200">
                {#each $cart as item (item._id)}
                    <div class="p-4 flex items-center space-x-4" transition:slide>
                        <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            on:change={() => toggleSelection(item._id)}
                            class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div class="w-20 h-20 flex-shrink-0">
                            {#if item.image}
                                <img 
                                    src={item.image} 
                                    alt={item.name}
                                    class="w-full h-full object-cover rounded"
                                />
                            {:else}
                                <div class="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <span class="text-gray-400 text-sm">No image</span>
                                </div>
                            {/if}
                        </div>

                        <!-- Item Details -->
                        <div class="flex-grow">
                            <h3 class="font-semibold">{item.name}</h3>
                            <p class="text-sm text-gray-600">${item.price}</p>
                        </div>

                        <!-- Quantity Controls -->
                        <div class="flex items-center space-x-2">
                            <button 
                                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                on:click={() => updateQuantity(item, item.quantity - 1)}
                            >
                                -
                            </button>
                            <span class="w-8 text-center">{item.quantity}</span>
                            <button 
                                class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                on:click={() => updateQuantity(item, item.quantity + 1)}
                            >
                                +
                            </button>
                        </div>

                        <!-- Item Total -->
                        <div class="w-24 text-right">
                            <p class="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>

                        <!-- Remove Button -->
                        <button 
                            class="text-red-500 hover:text-red-700"
                            on:click={() => cart.removeItem(item.id)}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Updated bottom panel -->
        <div class="max-w-4xl bg-gray-50 border-t shadow-lg">
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <span class="font-semibold">Total</span>
                        <span class="text-sm text-gray-500 ml-2">({selectedItems.size} items selected)</span>
                    </div>
                    <span class="text-xl font-bold">${total.toFixed(2)}</span>
                </div>

                <button 
                    class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    on:click={placeOrder}
                    disabled={selectedItems.size === 0}
                >
                    Place Order ({selectedItems.size} items)
                </button>
            </div>
        </div>
    {/if}
</div>
