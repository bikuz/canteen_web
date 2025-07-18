<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { getItems } from '../services/apiHandler';

    let orders = [];
    let isLoading = true;
    let startDate = '';
    let endDate = '';
    let selectedStatus = null;
    let statistics = {
        totalOrders: 0,
        createdOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0
    };
    let selectedOrder = null;
    let searchQuery = '';

    onMount(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        endDate = end.toISOString().split('T')[0];
        startDate = start.toISOString().split('T')[0];
        
        fetchOrders();
    });

    async function fetchOrders() {
        isLoading = true;
        try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (selectedStatus) queryParams.append('orderStatus', selectedStatus);
            if (searchQuery.trim()) queryParams.append('customer', searchQuery.trim());

            await getItems({
                endPoint: `orders?${queryParams.toString()}`,
                onSuccess: (response) => {
                    orders = response.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    calculateStatistics();
                }
            });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            alert('Failed to load orders. Please try again later.');
        } finally {
            isLoading = false;
        }
    }

    function calculateStatistics() {
        statistics = orders.reduce((acc, order) => {
            acc.totalOrders++;
            switch(order.status) {
                case 'created':
                    acc.createdOrders++;
                    break;
                case 'processing':
                    acc.processingOrders++;
                    break;
                case 'completed':
                    acc.completedOrders++;
                    break;
                case 'cancelled':
                    acc.cancelledOrders++;
                    break;
            }
            return acc;
        }, {
            totalOrders: 0,
            createdOrders: 0,
            processingOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0
        });
    }

    function handleFilterChange() {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        fetchOrders();
    }

    function filterByStatus(status) {
        selectedStatus = selectedStatus === status ? null : status;
        fetchOrders();
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function formatCurrency(amount) {
        return `Rs. ${amount.toFixed(2)}`;
    }

    function showOrderDetail(order) {
        selectedOrder = order;
    }

    function closeOrderDetail() {
        selectedOrder = null;
    }
</script>

<div class="container mx-auto p-4 max-w-6xl">
    <div class="mb-6">
        
        
        <!-- Search and Filter Section -->
        <div class="bg-white p-4 rounded-lg shadow">
            <h1 class="text-2xl font-bold mb-4">Order Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <!-- Search Input -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search customer..."
                        class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Date Range Inputs -->
                <div class="flex items-center gap-2">
                    <label for="startDate" class="text-sm text-gray-600 whitespace-nowrap">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        bind:value={startDate}
                         
                        class="flex-1 border rounded px-2 py-2 text-sm"
                    />
                </div>
                <div class="flex items-center gap-2">
                    <label for="endDate" class="text-sm text-gray-600 whitespace-nowrap">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        bind:value={endDate}
                         
                        class="flex-1 border rounded px-2 py-2 text-sm"
                    />
                </div>

                <!-- Apply Filters Button -->
                <button 
                    class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    on:click={handleFilterChange}
                >
                    Apply Filters
                </button>
            </div>
        </div>
    </div>

    {#if isLoading}
        <div class="text-center py-8">
            <p class="text-gray-500">Loading ...</p>
        </div>
    {:else}
        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <!-- Total Orders Card -->
            <div 
                class="bg-gray-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === null ? 'ring-2 ring-gray-400' : ''}"
                on:click={() => filterByStatus(null)}
            >
                <h3 class="text-gray-700 text-sm">Total Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    <p class="text-2xl font-bold text-gray-700">{statistics.totalOrders}</p>
                </div>
            </div>

            <!-- Created Orders Card -->
            <div 
                class="bg-blue-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === 'created' ? 'ring-2 ring-blue-400' : ''}"
                on:click={() => filterByStatus('created')}
            >
                <h3 class="text-blue-700 text-sm">Created Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    <p class="text-2xl font-bold text-blue-700">
                        {#if selectedStatus === null || selectedStatus === 'created'}
                            {statistics.createdOrders}
                        {:else}
                            <span class="text-sm">Click to view</span>
                        {/if}
                    </p>
                </div>
            </div>

            <!-- Processing Orders Card -->
            <div 
                class="bg-yellow-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === 'processing' ? 'ring-2 ring-yellow-400' : ''}"
                on:click={() => filterByStatus('processing')}
            >
                <h3 class="text-yellow-700 text-sm">Processing Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    <p class="text-2xl font-bold text-yellow-700">
                        {#if selectedStatus === null || selectedStatus === 'processing'}
                            {statistics.processingOrders}
                        {:else}
                            <span class="text-sm">Click to view</span>
                        {/if}
                    </p>
                </div>
            </div>

            <!-- Completed Orders Card -->
            <div 
                class="bg-green-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === 'completed' ? 'ring-2 ring-green-400' : ''}"
                on:click={() => filterByStatus('completed')}
            >
                <h3 class="text-green-700 text-sm">Completed Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    <p class="text-2xl font-bold text-green-700">
                        {#if selectedStatus === null || selectedStatus === 'completed'}
                            {statistics.completedOrders}
                        {:else}
                            <span class="text-sm">Click to view</span>
                        {/if}
                    </p>
                </div>
            </div>

            <!-- Cancelled Orders Card -->
            <div 
                class="bg-red-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === 'cancelled' ? 'ring-2 ring-red-400' : ''}"
                on:click={() => filterByStatus('cancelled')}
            >
                <h3 class="text-red-700 text-sm">Cancelled Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    <p class="text-2xl font-bold text-red-700">
                        {#if selectedStatus === null || selectedStatus === 'cancelled'}
                            {statistics.cancelledOrders}
                        {:else}
                            <span class="text-sm">Click to view</span>
                        {/if}
                    </p>
                </div>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-lg shadow p-4 max-h-[calc(100vh-23rem)] overflow-y-auto">
            <table class="min-w-full">
                <thead class="sticky top-[-1rem]">
                    <tr class="bg-gray-50">
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {#if selectedStatus === 'cancelled'}
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancel Reason</th>
                        {/if}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each orders as order}
                        <tr 
                            class="hover:bg-gray-50 cursor-pointer"
                            on:click={() => showOrderDetail(order)}
                        >
                            <td class="px-6 py-2 whitespace-nowrap">
                                #{order.shortId}
                                <p class="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                            </td>
                            <td class="px-6 py-2 whitespace-nowrap">
                                {#if order.userProfile}
                                    {order.userProfile.firstName || ''} {order.userProfile.lastName || ''}
                                {:else}
                                    <span class="text-gray-400">No user data</span>
                                {/if}
                            </td>
                            <td class="px-6 py-2 whitespace-nowrap">{formatCurrency(order.totalPrice)}</td>
                            <td class="px-6 py-2 whitespace-nowrap">{order.status}</td>
                            {#if selectedStatus === 'cancelled'}
                                <td class="px-6 py-2 whitespace-nowrap">{order.cancelReason}</td>
                            {/if}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    {#if selectedOrder}
        <!-- Overlay -->
        <div 
            class="fixed inset-0 bg-black bg-opacity-50 z-40"
            on:click={closeOrderDetail}
            transition:fade
        ></div>
        <!-- Detail Panel -->
        <div
            class="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white z-50 shadow-xl"
            transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}
        >
            <div class="h-full flex flex-col p-6">
                <!-- Close Button -->
                <button 
                    class="absolute top-4 right-4 bg-red-600 text-gray-50 hover:text-gray-700"
                    on:click={closeOrderDetail}
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <!-- Order ID (Fixed at the top) -->
                <h2 class="text-2xl font-bold mb-4 flex-shrink-0">Order #{selectedOrder.shortId}</h2>

                <!-- Scrollable Content -->
                <div class="flex-grow overflow-y-auto space-y-6">
                    <!-- Customer Information -->
                    <div class="space-y-2 bg-gray-100 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold">Customer Information</h3>
                        {#if selectedOrder.userProfile}
                            <p class="text-gray-600">Name: {selectedOrder.userProfile.firstName || ''} {selectedOrder.userProfile.lastName || ''}</p>
                            <p class="text-gray-600">Email: {selectedOrder.userProfile.email || 'N/A'}</p>
                            <p class="text-gray-600">Phone: {selectedOrder.userProfile.phoneNumber || 'N/A'}</p>
                        {:else}
                            <p class="text-gray-400">No user information available</p>
                        {/if}
                    </div>

                    <!-- Order Information -->
                    <div class="space-y-2 bg-gray-100 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold">Order Information</h3>
                        <p class="text-gray-600">Date: {formatDate(selectedOrder.createdAt)}</p>
                        <p class="text-gray-600">Status: {selectedOrder.status}</p>
                        {#if selectedOrder.status === 'cancelled'}
                            <p class="text-gray-600">Cancel Reason: {selectedOrder.cancelReason}</p>
                        {/if}
                        <p class="text-gray-600">Token: {selectedOrder.token}</p>
                    </div>

                    <!-- Order Items -->
                    <div class="space-y-2 bg-gray-100 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold">Order Items</h3>
                        <ul class="list-disc list-inside">
                            {#each selectedOrder.foodItems as item, index}
                                <li class="text-gray-600">{item.name} - {selectedOrder.quantities[index]} x {formatCurrency(item.price)}</li>
                            {/each}
                        </ul>
                    </div>
                </div>

                <!-- Total Amount (Fixed at the bottom) -->
                <div class="space-y-2 p-4 rounded-lg flex-shrink-0">
                    <h3 class="text-lg font-semibold">Total Amount</h3>
                    <p class="text-2xl font-bold text-blue-600">{formatCurrency(selectedOrder.totalPrice)}</p>
                </div>
            </div>
        </div>
    {/if}
</div>
