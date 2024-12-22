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
    let searchInputRef;
    let hasSearched = false;
    let focusedOrderIndex = -1;
    let paymentMethod = 'Cash'; // Default payment method

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
            queryParams.append('paymentStatus', 'pending');

            await getItems({
                endPoint: `orders?${queryParams.toString()}`,
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

    async function makePayment(order) {
        if (!confirm(`Confirm payment for Order #${order.shortId}?`)) return;

        try {
           
            await patchItem(
                {paymentMethod }, // Include paymentMethod
                {
                    endPoint: `orders/${order._id}/payment`,
                    onSuccess: () => {
                        alert('Payment successful!');
                        fetchOrders(); // Refresh the list
                        searchToken = ''; // Clear search
                        searchShortId = '';
                        searchInputRef.focus();
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
                case 'm': // New shortcut for payment method
                    event.preventDefault();
                    document.getElementById('paymentMethod').focus();
                    break;
            }
        }

        if (orders.length === 0) return;

        switch(event.key) {
            case 'ArrowDown':
                event.preventDefault();
                focusedOrderIndex = Math.min(focusedOrderIndex + 1, orders.length - 1);
                scrollToFocusedOrder();
                break;
            case 'ArrowUp':
                event.preventDefault();
                focusedOrderIndex = Math.max(focusedOrderIndex - 1, 0);
                scrollToFocusedOrder();
                break;
            case 'Enter':
                if (focusedOrderIndex >= 0) {
                    makePayment(orders[focusedOrderIndex]);
                }
                break;
            case 'Escape':
                searchToken = '';
                searchShortId = '';
                orders = []; // Clear the orders array
                searchInputRef.focus();
                break;
        }
    }

    function scrollToFocusedOrder() {
        const tableContainer = document.querySelector('.payTable');
        const focusedRow = tableContainer.querySelectorAll('tr')[focusedOrderIndex];
        if (focusedRow) {
            const rowTop = focusedRow.offsetTop;
            const rowBottom = rowTop + focusedRow.offsetHeight*2;
            const containerTop = tableContainer.scrollTop;
            const containerBottom = containerTop + tableContainer.clientHeight;

            if (rowBottom > containerBottom) {
                tableContainer.scrollTop = rowBottom - tableContainer.clientHeight;
            } else if (rowTop < containerTop) {
                tableContainer.scrollTop =  rowTop;
            }
        }
    }

    function handleSearch() {
        if (searchToken.trim() || searchShortId.trim()) {
            fetchOrders();
        }
    }

    $: if (searchToken || searchShortId) {
        handleSearch();
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="container mx-auto p-4 pt-2 max-w-5xl">
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
            <div>Ctrl+M: Focus Payment Method</div>
            <div>Ctrl+F: Focus from date</div>
            <div>Ctrl+E: Focus to date</div>
            <div>Esc: Clear search</div>
        </div>
    </div>

    <!-- Search Controls -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 mb-2">
        <div class="flex flex-col">
            <label for="token" class="text-sm text-gray-600 mb-1">Token (Ctrl+K)</label>
            <input
                id="token"
                bind:value={searchToken}
                bind:this={searchInputRef}
                placeholder="Enter token to search..."
                class="border rounded px-3 py-2"
            />
        </div>
        <div class="flex flex-col">
            <label for="shortId" class="text-sm text-gray-600 mb-1">Order ID (Ctrl+O)</label>
            <input
                id="shortId"
                bind:value={searchShortId}
                placeholder="Enter order ID to search..."
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
                on:input={() => fetchOrders()}
                class="border rounded px-3 py-2"
            />
        </div>
        <div class="flex flex-col">
            <label for="endDate" class="text-sm text-gray-600 mb-1">To (Ctrl+E)</label>
            <input
                type="date"
                id="endDate"
                bind:value={endDate}
                on:input={() => fetchOrders()}
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
                                <th style="width: 55%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th style="width: 8%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th style="width: 7%" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {#each orders as order, index}
                                <tr 
                                    class="hover:bg-blue-50 {index === focusedOrderIndex ? 'bg-blue-100' : ''}"
                                    on:click={() => makePayment(order)}
                                >
                                    <td style="width: 8%" class="px-6 py-4 whitespace-nowrap font-bold">{order.token}</td>
                                    <td style="width: 10%" class="px-6 py-4 whitespace-nowrap">#{order.shortId}</td>
                                    <td style="width: 12%" class="px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                                    <td style="width: 55%" class="px-6 py-4">
                                        <div class="text-sm space-y-1">
                                            {#each order.foodItems as item, i}
                                                <div class="whitespace-nowrap">{item.name} ({order.quantities[i]})</div>
                                            {/each}
                                        </div>
                                    </td>
                                    <td style="width: 8%" class="px-6 py-4 whitespace-nowrap font-semibold">{formatCurrency(order.totalPrice)}</td>
                                    <td style="width: 7%" class="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                                            on:click|stopPropagation={() => makePayment(order)}
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
</div> 