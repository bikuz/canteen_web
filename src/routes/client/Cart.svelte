<script>
    import { cart } from '../../stores/cartStore';
    import { slide, fade } from 'svelte/transition';
    import { createItem, postItems } from '../../services/apiHandler';
    import { onMount } from 'svelte';
    import { Rss } from 'svelte-hero-icons';

    // Add selected items tracking
    let selectedItems = new Set();
    let isLoading = true;
    let unavailableItems = [];
    let showInvoicePopup = false;

    // Check items availability when component mounts
    onMount(async () => {
        if ($cart.length > 0) {
            try {
                let itemIds = [...new Set($cart.map(item => item._id))];
                await postItems(
                    { foodItems: itemIds },
                    {
                    endPoint: 'orders/checkItems',
                    onSuccess: (response) => {
                         // Filter unavailable items from response
                        unavailableItems = response.foodItems.filter(item => 
                            !item.isAvailable || !item.isOrderingAllowed
                        );
                    }
                });
            } catch (error) {
                console.error('Failed to check items availability:', error);
                alert('Failed to check items availability. Please try again later.');
            } finally {
                isLoading = false;
            }
        } else {
            isLoading = false;
        }
    });

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
                // cusotmer: $user._id,
                foodItems: selectedItemsData.map(item => item._id),
                quantities: selectedItemsData.map(item => item.quantity),
                totalPrice: total,
                paymentMethod: 'cash',
            };

            // Use createItem from apiHandler to create the order
            await createItem(orderData, {
                endPoint: 'orders',
                onSuccess: (response) => {
                    if (response.success) {
                        // Show success message with token number
                        alert(`Order placed successfully! 
                        Your token number is: ${response.order.token}\nPlease 
                        remember this token number for payment.`);
                        
                        // Remove ordered items from cart and clear selection
                        selectedItems.forEach(itemId => cart.removeItem(itemId));
                        selectedItems.clear();
                    } else {
                        // Filter available items and show them to user
                        const availableItems = selectedItemsData.filter(item => 
                            !item.isAvailable || !item.isOrderingAllowed
                        );
                        
                        const unavailableItemNames = availableItems
                            .map(item => item.name)
                            .join(', ');
                        
                        alert(`Some items are currently unavailable: ${unavailableItemNames}\nPlease remove these items and try again.`);
                    }
                },
                onError: (error) => {
                    alert(`Failed to place order: ${error.message}`);
                }
            });

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

    {#if isLoading}
        <div class="text-center py-8 bg-white rounded-lg shadow">
            <p class="text-gray-500">Checking items availability...</p>
        </div>
    {:else if $cart.length === 0}
        <div class="text-center py-8 bg-white rounded-lg shadow" transition:fade>
            <p class="text-gray-500">Your cart is empty</p>
        </div>
    {:else}

        <div class="bg-white rounded-lg shadow overflow-auto max-h-[calc(100vh-250px)]">
                    <!-- Available Items Section -->
            <div class="bg-white ">
                <!-- <h2 class="text-lg font-semibold p-4 border-b">Available Items</h2> -->
                <div class="divide-y divide-gray-200">
                    {#each $cart.filter(item => !unavailableItems.some(unavailableItem => unavailableItem._id === item._id)) as item (item._id)}
                        <div class="p-4 flex items-center space-x-4" transition:slide>
                            <input
                                type="checkbox"
                                checked={selectedItems.has(item._id)}
                                on:change={() => toggleSelection(item._id)}
                                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div class="w-20 h-20 flex-shrink-0 cursor-pointer 
                            transition-all duration-300 ease-in-out
                            hover:border-4 hover:border-white hover:rounded-lg hover:shadow-lg"
                            on:click={() => toggleSelection(item._id)}
                            >
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
                                <p class="text-sm text-gray-600">Rs. {item.price}</p>
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
                                <p class="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                           
                            <!-- Remove Button -->
                            <button 
                                class="text-red-500 hover:text-red-700"
                                on:click={() => cart.removeItem(item._id)}
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Unavailable Items Section -->
            {#if unavailableItems.length > 0}
                <div class="bg-white">
                    <h2 class="text-lg font-semibold p-4 border-b text-red-600">Unavailable Items</h2>
                    <div class="divide-y divide-gray-200">
                        {#each $cart.filter(item => unavailableItems.some(unavailableItem => unavailableItem._id === item._id)) as item (item._id)}
                            <div class="p-4 flex items-center space-x-4 opacity-60" transition:slide>
                                <input
                                    type="checkbox"
                                    disabled
                                    class="w-4 h-4 text-gray-400 rounded focus:ring-gray-400"
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
                                    <p class="text-sm text-gray-600">Rs. {item.price}</p>
                                    <p class="text-red-500 text-sm mt-1">Currently unavailable</p>
                                </div>

                                <!-- Quantity Controls -->
                                <div class="flex items-center space-x-2">
                                    <span class="w-8 text-center">{item.quantity}</span>
                                </div>

                                <!-- Item Total -->
                                <div class="w-24 text-right">
                                    <p class="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
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
            {/if}
        </div>

        <!-- Bottom panel remains the same -->
        <div class="max-w-4xl bg-gray-50 border-t shadow-lg">
            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <span class="font-semibold">Total</span>
                        <span class="text-sm text-gray-500 ml-2">({selectedItems.size} items selected)</span>
                    </div>
                    <span class="text-xl font-bold">Rs. {total.toFixed(2)}</span>
                </div>

                <button 
                    class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    on:click={() => showInvoicePopup = true}
                    disabled={selectedItems.size === 0}
                >
                    Checkout ({selectedItems.size} items)
                </button>
            </div>
        </div>
    {/if}

    {#if showInvoicePopup}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
                <!-- Fixed Header -->
                <div class="p-6 border-b">
                    <h2 class="text-2xl font-bold">Checkout ({selectedItems.size} items)</h2>
                </div>
                
                <!-- Scrollable Content -->
                <div class="p-6 overflow-y-auto flex-1">
                    <div class="space-y-4">
                        {#each $cart.filter(item => selectedItems.has(item._id)) as item}
                            <div class="flex justify-between items-center">
                                <div>
                                    <p class="font-semibold">{item.name}</p>
                                    <p class="text-sm text-gray-600">Rs. {item.price} × {item.quantity}</p>
                                </div>
                                <p class="font-semibold">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Fixed Footer -->
                <div class="p-6 border-t">
                    <div class="flex justify-between items-center font-bold mb-4">
                        <p>Total Amount</p>
                        <p>Rs. {total.toFixed(2)}</p>
                    </div>
                    
                    <div class="flex justify-end space-x-4">
                        <button 
                            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            on:click={() => showInvoicePopup = false}
                        >
                            Close
                        </button>
                        <button 
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            on:click={placeOrder}
                        >
                            Confirm Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
