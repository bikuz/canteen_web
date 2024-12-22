<script>
    import { onMount } from 'svelte';
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
</script>

<div class="container mx-auto p-4 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Order Dashboard</h1>
        
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <label for="startDate" class="text-sm text-gray-600">From:</label>
                <input
                    type="date"
                    id="startDate"
                    bind:value={startDate}
                    on:change={handleFilterChange}
                    class="border rounded px-2 py-1 text-sm"
                />
            </div>
            <div class="flex items-center gap-2">
                <label for="endDate" class="text-sm text-gray-600">To:</label>
                <input
                    type="date"
                    id="endDate"
                    bind:value={endDate}
                    on:change={handleFilterChange}
                    class="border rounded px-2 py-1 text-sm"
                />
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
        <div class="bg-white rounded-lg shadow p-4 max-h-[calc(100vh-17rem)] overflow-y-auto">
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
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-2 whitespace-nowrap">
                                #{order.shortId}
                                <p class="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                            </td>
                            <td class="px-6 py-2 whitespace-nowrap">{order.userProfile.firstName} {order.userProfile.lastName}</td>
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
</div>
