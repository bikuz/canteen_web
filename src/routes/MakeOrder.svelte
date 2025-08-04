<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as api from '../services/apiHandler';
    // import { getItems } from '../../services/apiHandler';
    import UserSearch from '../partials/components/UserSearch.svelte';

    let categories = [];
    let foodItems = [];
    let filteredFoodItems = [];
    let selectedCategoryIndex = 0;
    let selectedItemIndex = 0;
    let selectedOrderItemIndex = -1;
    let order = writable([]);
    let showInvoicePopup = false;
    let selectedUser = null;
    let isGuestOrder = true;
    let showUserTypeSelection = false;
    let isPanelOpen = false;

    // Add a summary of keyboard shortcuts
    const keyboardShortcuts = [
        { key: '←', action: 'Move to previous category' },
        { key: '→', action: 'Move to next category' },
        { key: '↑', action: 'Move up in food items' },
        { key: '↓', action: 'Move down in food items' },
        { key: 'Enter', action: 'Add selected item' },
        { key: 'w', action: 'Move up in order' },
        { key: 's', action: 'Move down in order' },
        { key: 'd', action: 'Deduct item' },
        { key: 'r', action: 'Remove item' },
        { key: 'F4', action: 'Confirm order' },
    ];

    // Watch for category selection changes
    $: {
        if (categories.length > 0 && foodItems.length > 0) {
            const selectedCategory = categories[selectedCategoryIndex];
            filteredFoodItems = foodItems.filter(item => 
                item.category._id === selectedCategory._id
            );
            // Reset item selection when category changes
            selectedItemIndex = 0;
        }
    }

    onMount(async () => {
        try {
            await api.getItems({
                endPoint: 'menus/today/fooditems',
                onSuccess: (data) => {
                    foodItems = data;
                    const categoryIds = new Set();

                    data.forEach(item => {
                        const category = item.category;
                        if (!categoryIds.has(category._id)) {
                            categoryIds.add(category._id);
                            categories.push(category);
                        }
                    });

                    categories = [...categories];
                    // Initialize filtered items
                    if (categories.length > 0) {
                        filteredFoodItems = foodItems.filter(item => 
                            item.category._id === categories[0]._id
                        );
                    }
                }
            });
        } catch (error) {
            console.error('Failed to load food items:', error);
        }
    });

    function handleKeydown(event) {
        // Only handle F4 if invoice popup is shown
        if (event.key === 'F4' && showInvoicePopup) {
            event.preventDefault(); // Prevent default browser behavior
            confirmOrder();
            return;
        }

        // Only handle other shortcuts if invoice popup is not shown
        if (!showInvoicePopup) {
            switch (event.key) {
                case 'ArrowUp':
                    selectedItemIndex = Math.max(selectedItemIndex - 1, 0);
                    scrollToItem('food-items', selectedItemIndex);
                    break;
                case 'ArrowDown':
                    selectedItemIndex = Math.min(selectedItemIndex + 1, filteredFoodItems.length - 1);
                    scrollToItem('food-items', selectedItemIndex);
                    break;
                case 'ArrowLeft':
                    selectedCategoryIndex = Math.max(selectedCategoryIndex - 1, 0);
                    scrollToItem('categories', selectedCategoryIndex);
                    break;
                case 'ArrowRight':
                    selectedCategoryIndex = Math.min(selectedCategoryIndex + 1, categories.length - 1);
                    scrollToItem('categories', selectedCategoryIndex);
                    break;
                case 'Enter':
                    if (selectedItemIndex >= 0 && selectedItemIndex < filteredFoodItems.length) {
                        addItemToOrder(filteredFoodItems[selectedItemIndex]);
                    }
                    break;
                case 'd':
                    deductItemFromOrder($order[selectedOrderItemIndex]);
                    break;
                case 'r':
                    removeItemFromOrder($order[selectedOrderItemIndex]);
                    break;
                case 'F4':
                    event.preventDefault(); // Prevent default browser behavior
                    finalizeOrder();
                    break;
                case 'w':
                    selectedOrderItemIndex = Math.max(selectedOrderItemIndex - 1, 0);
                    scrollToItem('order-summary', selectedOrderItemIndex);
                    break;
                case 's':
                    selectedOrderItemIndex = Math.min(selectedOrderItemIndex + 1, $order.length - 1);
                    scrollToItem('order-summary', selectedOrderItemIndex);
                    break;
            }
        }
    }

    function scrollToItem(section, index) {
        const sectionElement = document.querySelector(`.${section}`);
        const itemElement = sectionElement?.children[index];
        itemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async function addItemToOrder(item) {
        //check fooditem if it is available
        const queryParams = new URLSearchParams();
        if (item) queryParams.append('foodItemId', item._id);

        await api.getItems(
            {
                endPoint: `orders/isOrderingAllowed?${queryParams.toString()}`,
                onSuccess: (response) => {
                   if(response.isOrderingAllowed === true){
                    order.update(currentOrder => {
                        const existingItem = currentOrder.find(i => i._id === item._id);
                        if (existingItem) {
                            existingItem.quantity += 1;
                        } else {
                            currentOrder.push({ ...item, quantity: 1 });
                        }
                        return currentOrder;
                    });
                   }else{
                    alert('Ordering is not allowed for this food item');
                   }
                },
                onError: (error) => {
                    alert('Failed to add item to order');
                }
            }
        );

    }

    function deductItemFromOrder(item) {
        order.update(currentOrder => {
            const existingItem = currentOrder.find(i => i._id === item._id);
            if (existingItem) {
                existingItem.quantity -= 1;
                if (existingItem.quantity <= 0) {
                    return currentOrder.filter(i => i._id !== item._id);
                }
            }
            return currentOrder;
        });
    }

    function removeItemFromOrder(item) {
        order.update(currentOrder => currentOrder.filter(i => i._id !== item._id));
    }

    async function finalizeOrder() {
        if ($order.length === 0) {
            alert('Please add items to the order first');
            return;
        }

        // Verify user selection for registered user orders
        if (!isGuestOrder && !selectedUser) {
            alert('Please select a user for registered order');
            isPanelOpen = true; // Open the panel to select user
            return;
        }

        // First show the invoice popup
        showInvoicePopup = true;
    }

    // Add new function to handle actual order creation
    async function confirmOrder() {
        try {
            const orderData = {
                foodItems: $order.map(item => item._id),
                quantities: $order.map(item => item.quantity),
                totalPrice: totalAmount,
                paymentMethod: 'cash',
            };

            if (!isGuestOrder && selectedUser) {
                orderData.userId = selectedUser._id;
            } else {
                orderData.isGuestOrder = true;
            }

            await api.createItem(orderData, {
                endPoint: 'orders/createOrderPayment',
                onSuccess: (response) => {
                    showInvoicePopup = false;
                    order.set([]); // Clear the order
                    selectedUser = null; // Reset selected user
                    alert('Order created successfully!');
                },
                onError: (error) => {
                    alert(`Failed to place order: ${error.message}`);
                }
            });
        } catch (error) {
            alert('Failed to place order. Please try again.');
        }
    }

     

    // Calculate total items and total amount
    $: totalItems = $order.reduce((sum, item) => sum + item.quantity, 0);
    $: totalAmount = $order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create a new type of order creation that includes user selection
    async function createOrder(orderData, userType = 'guest') {
        if (userType === 'registered') {
            // Include user ID in the order
            orderData.userId = selectedUser.id;
        } else {
            // Guest order (current implementation)
            orderData.isGuestOrder = true;
        }
        
        // Rest of your order creation logic
    }
</script>

<!-- Display keyboard shortcuts -->
<div class="bg-blue-100 p-2 rounded-lg mb-2 text-sm shadow">
    <!-- <h1 class="text-lg font-bold mb-2">Make Order</h1>
      -->
    <!-- Add button to top right corner and sliding panel -->
<div class="fixed top-20 right-4">
    <button 
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        on:click={() => isPanelOpen = !isPanelOpen}
    >
        {#if isGuestOrder}
            Guest Order
        {:else if selectedUser}
            {selectedUser.firstName} {selectedUser.lastName}
        {:else}
            Registered User
        {/if}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
    </button>
</div>

    <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold">Keyboard Shortcuts:</h3>
    </div>
    <div class="grid grid-cols-3 gap-2">
        {#each Array(4) as _, colIndex} <!-- Create 3 columns -->
            <div class="flex flex-col">
                {#each keyboardShortcuts.slice(colIndex * 4, (colIndex + 1) * 4) as shortcut} <!-- Slice items for each column -->
                    <div>{shortcut.key}: {shortcut.action}</div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<svelte:window on:keydown={handleKeydown} />



<!-- Sliding Panel -->
<div class="fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 z-30 {isPanelOpen ? 'translate-x-0' : 'translate-x-full'}">
    <div class="p-4">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Order Type</h2>
            <button 
                class="text-gray-500 hover:text-gray-700"
                on:click={() => isPanelOpen = false}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="space-y-4">
            <button 
                class="w-full px-4 py-2 rounded-lg {isGuestOrder ? 'bg-blue-600 text-white' : 'bg-gray-200'}"
                on:click={() => {
                    isGuestOrder = true;
                    selectedUser = null;
                }}
            >
                Guest Order
            </button>
            <button 
                class="w-full px-4 py-2 rounded-lg {!isGuestOrder ? 'bg-blue-600 text-white' : 'bg-gray-200'}"
                on:click={() => isGuestOrder = false}
            >
                Registered User
            </button>

            {#if !isGuestOrder}
                <div class="mt-6">
                    <UserSearch bind:selectedUser />
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Rest of your existing order interface -->
<div class="cashier-panel flex h-full">
    <!-- Categories Section -->
    <div class=" w-4/12 bg-gray-100 p-4 ">
        <h2 class="text-lg font-bold mb-4">Categories</h2>
        <div class="categories max-h-[calc(100vh-20rem)] overflow-y-auto">
            {#each categories as category, index}
                <div 
                    class="{selectedCategoryIndex === index ? 'selected' : ''} p-2 cursor-pointer hover:bg-gray-200"
                    on:click={() => {
                        selectedCategoryIndex = index;
                        scrollToItem('categories', index);
                    }}
                >
                    {category.name}
                </div>
            {/each}
        </div>
    </div>

    <!-- Food Items Section -->
    <div class=" w-5/12 bg-white p-4 overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Food Items</h2>
        <div class="food-items max-h-[calc(100vh-20rem)] overflow-y-auto">
            {#each filteredFoodItems as item, index}
                <div 
                    class="{selectedItemIndex === index ? 'selected' : ''} p-2 cursor-pointer hover:bg-gray-200"
                    on:click={() => {
                        selectedItemIndex = index;
                        scrollToItem('food-items', index);
                        addItemToOrder(item);
                    }}
                >
                    <h3 class="font-semibold">{item.name}</h3>
                    <p class="text-sm text-gray-600">Rs. {item.price}</p>
                </div>
            {/each}
        </div>
    </div>

    <!-- Order Summary Section -->
    <div class="w-5/12 bg-gray-100 p-4 overflow-y-auto">
        <!-- <h2 class="text-lg font-bold mb-4">Order Summary</h2> -->
                 <!-- Display total items and total amount -->
        <div class="total-summary">
            <p class="font-bold">Total Items: {totalItems}</p>
            <p class="font-bold">Total Amount: Rs. {totalAmount.toFixed(2)}</p>
        </div>

        <div class="order-summary max-h-[calc(100vh-24rem)] overflow-y-auto">
            {#each $order as item, index}
                <div 
                    class="{selectedOrderItemIndex === index ? 'selected' : ''} p-2 cursor-pointer hover:bg-gray-200"
                    on:click={() => {
                        selectedOrderItemIndex = index;
                        scrollToItem('order-summary', index);
                    }}
                >
                    <h3 class="font-semibold">{item.name} x {item.quantity}</h3>
                    <p class="text-sm text-gray-600">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                    <!-- Add action buttons for the selected item -->
                    <div class="flex gap-2 mt-2">
                        <button 
                            class="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            on:click|stopPropagation={() => addItemToOrder(item)}
                        >
                            +
                        </button>
                        <button 
                            class="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            on:click|stopPropagation={() => deductItemFromOrder(item)}
                        >
                            -
                        </button>
                        <button 
                            class="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                            on:click|stopPropagation={() => removeItemFromOrder(item)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        <button 
            class="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            on:click={finalizeOrder}
        >
            Finalize Order
        </button>
    </div>
</div>

<!-- Invoice Popup -->
{#if showInvoicePopup}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <!-- Fixed Header -->
            <div class="p-6 border-b">
                <h2 class="text-2xl font-bold">Order Invoice ({totalItems} items)</h2>
            </div>
            
            <!-- Add user information if it's a registered user order -->
            {#if !isGuestOrder && selectedUser}
                <div class="px-6 py-2 border-b">
                    <p class="font-semibold">Customer: {selectedUser.firstName} {selectedUser.lastName}</p>
                    <p class="text-sm text-gray-600">Phone: {selectedUser.phoneNumber}</p>
                </div>
            {/if}
            
            <!-- Scrollable Content -->
            <div class="p-6 overflow-y-auto flex-1">
                <div class="space-y-4">
                    {#each $order as item}
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
                    <p>Rs. {totalAmount.toFixed(2)}</p>
                </div>
                
                <div class="flex justify-end space-x-4">
                    <button 
                        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        on:click={() => showInvoicePopup = false}
                    >
                        Cancel
                    </button>
                    <button 
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        on:click={confirmOrder}
                    >
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .selected {
        background-color: #c5dcf9;
    }
    :global(body) {
        overflow-x: hidden;
    }
</style>
