<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as api from '../services/apiHandler';

    let categories = [];
    let foodItems = [];
    let filteredFoodItems = [];
    let selectedCategoryIndex = 0;
    let selectedItemIndex = 0;
    let selectedOrderItemIndex = -1;
    let order = writable([]);

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
                endPoint: 'menus/day/Sunday/fooditems',
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
            case 'd': // Deduct item from order summary
                deductItemFromOrder($order[selectedOrderItemIndex]);
                break;
            case 'r': // Remove item from order summary
                removeItemFromOrder($order[selectedOrderItemIndex]);
                break;
            case 'F4': // Change from 'f' to 'F4'
                finalizeOrder();
                break;
            case 'w': // Move up in order summary
                selectedOrderItemIndex = Math.max(selectedOrderItemIndex - 1, 0);
                scrollToItem('order-summary', selectedOrderItemIndex);
                break;
            case 's': // Move down in order summary
                selectedOrderItemIndex = Math.min(selectedOrderItemIndex + 1, $order.length - 1);
                scrollToItem('order-summary', selectedOrderItemIndex);
                break;
        }
    }

    function scrollToItem(section, index) {
        const sectionElement = document.querySelector(`.${section}`);
        const itemElement = sectionElement?.children[index];
        itemElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function addItemToOrder(item) {
        order.update(currentOrder => {
            const existingItem = currentOrder.find(i => i._id === item._id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                currentOrder.push({ ...item, quantity: 1 });
            }
            return currentOrder;
        });
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

    function finalizeOrder() {
        console.log('Order finalized:', $order);
        order.set([]);
    }

    // Calculate total items and total amount
    $: totalItems = $order.reduce((sum, item) => sum + item.quantity, 0);
    $: totalAmount = $order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
</script>

<!-- Display keyboard shortcuts -->
<div class="bg-blue-100 p-2 rounded-lg mb-2 text-sm shadow">
    <h1 class="text-lg font-bold mb-2">Make Order</h1>
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

<div class="cashier-panel flex h-full">
    <!-- Categories Section -->
    <div class=" w-4/12 bg-gray-100 p-4 ">
        <h2 class="text-lg font-bold mb-4">Categories</h2>
        <div class="categories max-h-[calc(100vh-20rem)] overflow-y-auto">
            {#each categories as category, index}
                <div class="{selectedCategoryIndex === index ? 'selected' : ''} p-2 cursor-pointer hover:bg-gray-200">
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
                <div class="{selectedItemIndex === index ? 'selected' : ''} p-2 cursor-pointer hover:bg-gray-200">
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
                <div class="{selectedOrderItemIndex === index ? 'selected' : ''} p-2">
                    <h3 class="font-semibold">{item.name} x {item.quantity}</h3>
                    <p class="text-sm text-gray-600">Rs. {(item.price * item.quantity).toFixed(2)}</p>
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

<style>
    .selected {
        background-color: #c5dcf9;
    }
</style>
