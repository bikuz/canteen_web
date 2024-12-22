<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { getItems } from '../services/apiHandler';
    import { navigate } from 'svelte-routing';
    import { quintOut } from 'svelte/easing';

    let orders = [];
    let isLoading = true;
    let startDate = '';
    let endDate = '';
    let statistics = {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        cancelledAmount: 0,
        totalOrders: 0,
        paidOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0
    };
    let selectedStatus = null;
    let selectedOrder = null;

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
            if (selectedStatus) queryParams.append('paymentStatus', selectedStatus);

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
            acc.totalAmount += order.totalPrice;
            acc.totalOrders++;

            switch(order.paymentStatus) {
                case 'paid':
                    acc.paidAmount += order.totalPrice;
                    acc.paidOrders++;
                    break;
                case 'pending':
                    acc.pendingAmount += order.totalPrice;
                    acc.pendingOrders++;
                    break;
                case 'cancelled':
                    acc.cancelledAmount += order.totalPrice;
                    acc.cancelledOrders++;
                    break;
            }
            return acc;
        }, {
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            cancelledAmount: 0,
            totalOrders: 0,
            paidOrders: 0,
            pendingOrders: 0,
            cancelledOrders: 0
        });
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function formatCurrency(amount) {
        return `Rs. ${amount.toFixed(2)}`;
    }

    function handleFilterChange() {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        fetchOrders();
    }

    function viewOrderDetails(orderId) {
        navigate(`/client/orderDetail/${orderId}`);
    }

    function filterByStatus(status) {
        if (selectedStatus === status) {
            selectedStatus = null;
        } else {
            selectedStatus = status;
        }
        fetchOrders();
    }

    function showOrderDetail(order) {
        selectedOrder = order;
    }

    function closeOrderDetail() {
        selectedOrder = null;
    }
</script>

<div class="container mx-auto p-4 max-w-6xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Payment Dashboard</h1>
        
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
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- Total Orders Card -->
            <div 
                class="bg-white rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === null ? 'ring-2 ring-gray-400' : ''}"
                on:click={() => filterByStatus(null)}
            >
                <h3 class="text-gray-500 text-sm">Total Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    <p class="text-2xl font-bold">{statistics.totalOrders}</p>
                    <p class="text-lg font-semibold text-gray-700">{formatCurrency(statistics.totalAmount)}</p>
                </div>
            </div>

            <!-- Paid Orders Card -->
            <div 
                class="bg-green-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === 'paid' ? 'ring-2 ring-green-400' : ''}"
                on:click={() => filterByStatus('paid')}
            >
                <h3 class="text-green-700 text-sm">Paid Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    {#if !selectedStatus || selectedStatus === 'paid'}
                        <p class="text-2xl font-bold text-green-700">{statistics.paidOrders}</p>
                        <p class="text-lg font-semibold text-green-700">{formatCurrency(statistics.paidAmount)}</p>
                    {:else}
                        <p class="text-sm font-bold text-green-700">Click to view</p>
                    {/if}
                </div>
            </div>

            <!-- Pending Orders Card -->
            <div 
                class="bg-yellow-50 rounded-lg shadow p-4 cursor-pointer transition-all duration-200 hover:shadow-lg
                    {selectedStatus === 'pending' ? 'ring-2 ring-yellow-400' : ''}"
                on:click={() => filterByStatus('pending')}
            >
                <h3 class="text-yellow-700 text-sm">Pending Orders</h3>
                <div class="flex justify-between items-end mt-2">
                    {#if !selectedStatus || selectedStatus === 'pending'}
                        <p class="text-2xl font-bold text-yellow-700">{statistics.pendingOrders}</p>
                        <p class="text-lg font-semibold text-yellow-700">{formatCurrency(statistics.pendingAmount)}</p>
                    {:else}
                        <p class="text-sm font-bold text-yellow-700">Click to view</p>
                    {/if}
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
                    {#if !selectedStatus || selectedStatus === 'cancelled'}
                        <p class="text-2xl font-bold text-red-700">{statistics.cancelledOrders}</p>
                        <p class="text-lg font-semibold text-red-700">{formatCurrency(statistics.cancelledAmount)}</p>
                    {:else}
                        <p class="text-sm font-bold text-red-700">Click to view</p>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="bg-white rounded-lg shadow p-4 flex flex-col max-h-[calc(100vh-17rem)]">
            <h2 class="text-xl font-semibold mb-2 flex-shrink-0">Recent Transactions</h2>
            <div class="overflow-x-auto flex-grow overflow-y-auto">
                <table class="min-w-full">
                    <thead class="sticky top-0">
                        <tr class="bg-gray-50">
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
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
                                <td class="px-6 py-2 whitespace-nowrap">{order.userProfile.firstName} {order.userProfile.lastName}</td>
                                <td class="px-6 py-2 whitespace-nowrap">{formatCurrency(order.totalPrice)}</td>
                                <td class="px-6 py-2 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        {order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'}">
                                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-2 whitespace-nowrap capitalize">{order.paymentMethod}</td>
                                <td class="px-6 py-2 whitespace-nowrap">{order.token}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Order Detail Slide Panel -->
        {#if selectedOrder}
            <!-- Overlay -->
            <div 
                class="fixed inset-0 bg-black bg-opacity-50 z-40"
                on:click={closeOrderDetail}
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
                        <div class="space-y-2 bg-blue-100 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold">Customer Information</h3>
                            <p class="text-gray-600">Name: {selectedOrder.userProfile.firstName} {selectedOrder.userProfile.lastName}</p>
                            <p class="text-gray-600">Email: {selectedOrder.userProfile.email}</p>
                            <p class="text-gray-600">Phone: {selectedOrder.userProfile.phoneNumber}</p>
                        </div>

                        <!-- Order Information -->
                        <div class="space-y-2 bg-blue-100 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold">Order Information</h3>
                            <p class="text-gray-600">Date: {formatDate(selectedOrder.createdAt)}</p>
                            <p class="text-gray-600">Status: {selectedOrder.paymentStatus}</p>
                            <p class="text-gray-600">Method: {selectedOrder.paymentMethod}</p>
                            <p class="text-gray-600">Token: {selectedOrder.token}</p>
                        </div>

                        <!-- Order Items -->
                        <div class="space-y-2 bg-blue-100 p-4 rounded-lg">
                            <h3 class="text-lg font-semibold">Order Items</h3>
                            <ul class="list-disc list-inside">
                                {#each selectedOrder.foodItems as item, index}
                                    <li class="text-gray-600">{item.name} - {selectedOrder.quantities[index]} x {formatCurrency(item.price)}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <!-- Total Amount (Fixed at the bottom) -->
                    <div class="space-y-2  p-4 rounded-lg flex-shrink-0">
                        <h3 class="text-lg font-semibold">Total Amount</h3>
                        <p class="text-2xl font-bold text-blue-600">{formatCurrency(selectedOrder.totalPrice)}</p>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>
