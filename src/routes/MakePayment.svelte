<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { getItems, patchItem } from '../services/apiHandler';

    let orders = [];
    let isLoading = false;
    let startDate = '';
    let endDate = '';
    let searchToken = '';
    let searchShortId = '';
    let searchCustomer = '';
    let searchInputRef;
    let hasSearched = false;
    let focusedOrderIndex = -1;
    let paymentMethod = 'Cash'; // Default payment method
    let showConfirmDialog = false;
    let orderToConfirm = null;

    onMount(() => {
        const today = new Date();
        endDate = today.toISOString().split('T')[0];
        startDate = today.toISOString().split('T')[0];
        
        fetchOrders();
        searchInputRef.focus();
    });

    async function fetchOrders() {
        isLoading = true;
        hasSearched = true;
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (searchToken) queryParams.append('token', searchToken);
            if (searchShortId) queryParams.append('shortId', searchShortId);
            if (searchCustomer) queryParams.append('customer', searchCustomer);
            queryParams.append('paymentStatus', 'pending');

            await getItems({
                endPoint: `orders/searchOrderPayment?${queryParams.toString()}`,
                onSuccess: (response) => {
                    orders = response.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    focusedOrderIndex = orders.length > 0 ? 0 : -1;
                }
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            alert('Failed to load orders. Please try again later.');
        } finally {
            isLoading = false;
        }
    }

    function showPaymentConfirmation(order) {
        orderToConfirm = order;
        showConfirmDialog = true;
    }

    async function confirmPayment() {
        if (!orderToConfirm) return;

        try {
            await patchItem(
                {paymentMethod }, // Include paymentMethod
                {
                    endPoint: `orders/${orderToConfirm._id}/payment`,
                    onSuccess: () => {
                        alert('Payment successful!');
                        fetchOrders(); // Refresh the list
                        searchToken = ''; // Clear search
                        searchShortId = '';
                        searchCustomer = '';
                        searchInputRef.focus();
                        closeConfirmDialog();
                    },
                    onError: (error) => {
                        alert(error.message || 'Failed to process payment');
                    }
                }
            );
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Failed to process payment. Please try again.');
        }
    }

    function closeConfirmDialog() {
        showConfirmDialog = false;
        orderToConfirm = null;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function formatCurrency(amount) {
        return `Rs. ${amount.toFixed(2)}`;
    }

    // Keyboard navigation
    function handleKeydown(event) {
        // New shortcut handling for input focus
        if (event.ctrlKey && !event.altKey && !event.shiftKey) {
            switch(event.key.toLowerCase()) {
                case 'k':
                    event.preventDefault();
                    searchInputRef.focus();
                    break;
                case 'o':
                    event.preventDefault();
                    document.getElementById('shortId').focus();
                    break;
                case 'f':
                    event.preventDefault();
                    document.getElementById('startDate').focus();
                    break;
                case 'e':
                    event.preventDefault();
                    document.getElementById('endDate').focus();
                    break;
                case 'c': // New shortcut for customer search
                    event.preventDefault();
                    document.getElementById('customer').focus();
                    break;
                case 'm': // New shortcut for payment method
                    event.preventDefault();
                    document.getElementById('paymentMethod').focus();
                    break;
            }
        }

        // Check if any input field is focused
        const activeElement = document.activeElement;
        const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'SELECT' ||
            activeElement.id === 'token' ||
            activeElement.id === 'shortId' ||
            activeElement.id === 'customer' ||
            activeElement.id === 'paymentMethod' ||
            activeElement.id === 'startDate' ||
            activeElement.id === 'endDate'
        );

        if (orders.length === 0) return;

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                // Remove focus from any input field
                document.activeElement?.blur();
                focusedOrderIndex = Math.min(focusedOrderIndex + 1, orders.length - 1);
                scrollToFocusedOrder();
                break;
            case 'ArrowUp':
                event.preventDefault();
                // Remove focus from any input field
                document.activeElement?.blur();
                focusedOrderIndex = Math.max(focusedOrderIndex - 1, 0);
                scrollToFocusedOrder();
                break;
            case 'Enter':
                // Only allow payment if no input field is focused
                if (!isInputFocused && focusedOrderIndex >= 0) {
                    showPaymentConfirmation(orders[focusedOrderIndex]);
                }
                break;
            case 'Escape':
                // Close confirm dialog if it's open
                if (showConfirmDialog) {
                    closeConfirmDialog();
                } else {
                    // Clear search fields if dialog is not open
                    searchToken = '';
                    searchShortId = '';
                    searchCustomer = '';
                    orders = []; // Clear the orders array
                    searchInputRef.focus();
                }
                break;
        }
    }

    function scrollToFocusedOrder() {
        const tableContainer = document.querySelector('.payTable');
        const focusedRow = tableContainer.querySelectorAll('tr')[focusedOrderIndex+1];
        focusedRow?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // if (focusedRow) {
        //     const rowTop = focusedRow.offsetTop;
        //     const rowBottom = rowTop + focusedRow.offsetHeight*2;
        //     const containerTop = tableContainer.scrollTop;
        //     const containerBottom = containerTop + tableContainer.clientHeight;

        //     if (rowBottom > containerBottom) {
        //         tableContainer.scrollTop = rowBottom - tableContainer.clientHeight;
        //     } else if (rowTop < containerTop) {
        //         tableContainer.scrollTop =  rowTop;
        //     }
        // }
    }

    function handleSearch() {
        // Always fetch orders when search is triggered, even if fields are empty
        fetchOrders();
    }

    // Debounce function to prevent multiple rapid calls
    let searchTimeout;
    function debouncedSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            handleSearch();
        }, 300);
    }

    // Reactive statement for all search and filter fields
    $: if (searchToken !== undefined || searchShortId !== undefined || searchCustomer !== undefined || startDate !== undefined || endDate !== undefined) {
        debouncedSearch();
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="container mx-auto p-4 pt-2 h-full">
    <!-- Keyboard Shortcuts Help -->
    <div class="bg-blue-100 p-2 rounded-lg mb-2 text-sm shadow">
        <h1 class="text-lg font-bold mb-2">Make Payment</h1>
        <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold">Keyboard Shortcuts:</h3>
        </div>
        <div class="grid grid-cols-3 gap-2">
            <div>↑/↓: Navigate orders</div>
            <div>Enter: Make payment</div>
            <div>Ctrl+K: Focus token search</div>
            <div>Ctrl+O: Focus order ID search</div>
            <div>Ctrl+C: Focus customer search</div>
            <div>Ctrl+M: Focus Payment Method</div>
            <div>Ctrl+F: Focus from date</div>
            <div>Ctrl+E: Focus to date</div>
            <div>Esc: Clear search</div>
        </div>
    </div>

    <!-- Search Controls -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4 mb-2">
        <div class="flex flex-col">
            <label for="token" class="text-sm text-gray-600 mb-1">Token (Ctrl+K)</label>
            <input
                id="token"
                bind:value={searchToken}
                bind:this={searchInputRef}
                placeholder="search token..."
                class="border rounded px-3 py-2"
            />
        </div>
        <div class="flex flex-col">
            <label for="shortId" class="text-sm text-gray-600 mb-1">Order ID (Ctrl+O)</label>
            <input
                id="shortId"
                bind:value={searchShortId}
                placeholder="search order ID..."
                class="border rounded px-3 py-2"
            />
        </div>
        
        <div class="flex flex-col">
            <label for="customer" class="text-sm text-gray-600 mb-1">Customer (Ctrl+C)</label>
            <input
                id="customer"
                bind:value={searchCustomer}
                placeholder="search customer..."
                class="border rounded px-3 py-2"
            />
        </div>
        
        <!-- Payment Method Dropdown -->
        <div class="flex flex-col">
            <label for="paymentMethod" class="text-sm text-gray-600 mb-1">Payment Method (Ctrl+M)</label>
            <select
                id="paymentMethod"
                bind:value={paymentMethod}
                class="border rounded px-3 py-2"
            >
                <option value="Cash">Cash</option>
                <option value="eSewa">eSewa</option>
                <option value="fonepay">fonepay</option>
            </select>
        </div>
        <div class="flex flex-col">
            <label for="startDate" class="text-sm text-gray-600 mb-1">From (Ctrl+F)</label>
            <input
                type="date"
                id="startDate"
                bind:value={startDate}
                class="border rounded px-3 py-2"
            />
        </div>
        <div class="flex flex-col">
            <label for="endDate" class="text-sm text-gray-600 mb-1">To (Ctrl+E)</label>
            <input
                type="date"
                id="endDate"
                bind:value={endDate}
                class="border rounded px-3 py-2"
            />
        </div>
    </div>



    
    {#if isLoading}
        <div class="text-center py-8">
            <p class="text-gray-500">Searching orders...</p>
        </div>
    {:else if hasSearched}
        {#if orders.length === 0}
            <div class="text-center py-8 bg-white rounded-lg shadow">
                <p class="text-gray-500">No pending orders found</p>
            </div>
        {:else}
            <div class="bg-white rounded-lg shadow overflow-x-auto">
                <div class="payTable max-h-[calc(100vh-22rem)] overflow-y-auto">
                    <table class="min-w-full table-fixed">
                        <thead>
                            <tr class="bg-gray-50">
                                <th style="width: 8%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                                <th style="width: 10%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th style="width: 12%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th style="width: 25%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th style="width: 20%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th style="width: 10%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ext. No.</th>
                                <th style="width: 8%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th style="width: 7%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each orders as order, index}
                                <!-- <tr 
                                    class="hover:bg-blue-50 {index === focusedOrderIndex ? 'bg-blue-100' : ''}"
                                    on:click={() => makePayment(order)}
                                > -->
                                <tr 
                                    class="hover:bg-blue-50 {index === focusedOrderIndex ? 'bg-blue-100' : ''} cursor-pointer"
                                    on:click={() => focusedOrderIndex = index}
                                >
                                    <td style="width: 8%" class="px-6 py-4 whitespace-nowrap font-bold">{order.token}</td>
                                    <td style="width: 10%" class="px-6 py-4 whitespace-nowrap">#{order.shortId}</td>
                                    <td style="width: 12%" class="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                    <td style="width: 25%" class="px-6 py-4">
                                        <div class="text-sm space-y-1">
                                            {#each order.foodItems as item, i}
                                                <div class="whitespace-nowrap">{item.name} ({order.quantities[i]})</div>
                                            {/each}
                                        </div>
                                    </td>
                                    <td style="width: 20%" class="px-6 py-4 whitespace-nowrap">{order.userProfile.firstName} {order.userProfile.lastName}</td>
                                    <td style="width: 10%" class="px-6 py-4 whitespace-nowrap">{order.userProfile.phoneNumber}</td>
                                    <td style="width: 8%" class="px-6 py-4 whitespace-nowrap font-semibold">{formatCurrency(order.totalPrice)}</td>
                                    <td style="width: 7%" class="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                                            on:click|stopPropagation={() => showPaymentConfirmation(order)}
                                        >
                                            Pay
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        {/if}
    {:else}
        <div class="text-center py-8 bg-white rounded-lg shadow">
            <p class="text-gray-500">Enter token or order ID to search for pending payments</p>
        </div>
    {/if}

    <!-- Custom Confirm Dialog -->
    {#if showConfirmDialog && orderToConfirm}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                <!-- Header -->
                <div class="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                    <h3 class="text-lg font-semibold">Confirm Payment</h3>
                </div>
                
                <!-- Content -->
                <div class="px-6 py-4 flex-1 overflow-y-auto">
                    <div class="text-center mb-4">
                        <div class="text-3xl mb-3">💰</div>
                        <p class="text-gray-700 mb-4 text-sm">
                            Are you sure you want to process payment for:
                        </p>
                        
                        <!-- Compact Info Row -->
                        <div class="grid grid-cols-3 gap-3 mb-4">
                            <div class="text-center">
                                <span class="text-gray-600 text-xs block mb-1">Order Token:</span>
                                <div class="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                    {orderToConfirm.token}
                                </div>
                            </div>
                            <div class="text-center">
                                <span class="text-gray-600 text-xs block mb-1">Customer:</span>
                                <div class="text-lg font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                    {orderToConfirm.userProfile.firstName} {orderToConfirm.userProfile.lastName}
                                </div>
                            </div>
                            <div class="text-center">
                                <span class="text-gray-600 text-xs block mb-1">Payment Method:</span>
                                <div class="text-lg font-bold text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                                    {paymentMethod}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Order Details - Takes most of the space -->
                    <div class="bg-gray-50 rounded-lg p-4 mb-4">
                        <div class="text-sm text-gray-600 mb-3 font-semibold">Order Details:</div>
                        <div class="text-sm space-y-2 max-h-64 overflow-y-auto">
                            {#each orderToConfirm.foodItems as item, i}
                                <div class="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                                    <span class="flex-1 pr-2">{item.name} ({orderToConfirm.quantities[i]})</span>
                                    <span class="font-semibold text-right min-w-[80px]">{formatCurrency(item.price * orderToConfirm.quantities[i])}</span>
                                </div>
                            {/each}
                        </div>
                        <hr class="my-3 border-gray-300">
                        <div class="flex justify-between font-bold text-lg bg-white px-3 py-2 rounded">
                            <span>Total:</span>
                            <span class="text-blue-600">{formatCurrency(orderToConfirm.totalPrice)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3">
                    <button 
                        class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                        on:click={closeConfirmDialog}
                    >
                        Cancel
                    </button>
                    <button 
                        class="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                        on:click={confirmPayment}
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div> 
