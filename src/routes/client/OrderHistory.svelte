<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { getItems } from '../../services/apiHandler';
    import { navigate } from 'svelte-routing';

    let orders = [];
    let isLoading = true;
    let startDate = '';
    let endDate = '';

    // Set default date range (last 30 days)
    onMount(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        // Format dates for input fields (YYYY-MM-DD)
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

            await getItems(
                {
                    endPoint: `orders/history?${queryParams.toString()}`,
                    onSuccess: (response) => {
                        orders = response.sort((a, b) => 
                            new Date(b.createdAt) - new Date(a.createdAt)
                        );
                    }
                }
            );
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            alert('Failed to load orders. Please try again later.');
        } finally {
            isLoading = false;
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function viewOrderDetails(orderId) {
        navigate(`/client/orderDetail/${orderId}`);
    }

    // Handle date filter changes
    function handleFilterChange() {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        fetchOrders();
    }
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold">Order History</h1>
        
        <!-- Date Filter Section -->
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
        <div class="text-center py-8 bg-white rounded-lg shadow">
            <p class="text-gray-500">Loading orders...</p>
        </div>
    {:else if orders.length === 0}
        <div class="text-center py-8 bg-white rounded-lg shadow" transition:fade>
            <p class="text-gray-500">No orders found for the selected date range</p>
        </div>
    {:else}
        <div class="space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)] pr-4">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each orders as order}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div 
                    class="bg-white rounded-lg shadow p-4 transition-all duration-300 ease-in-out
                    hover:shadow-lg hover:bg-blue-50 hover:border-2 hover:border-gray-50 
                    cursor-pointer"
                    on:click={() => viewOrderDetails(order._id)}
                    transition:slide
                >
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold">#{order.shortId}</p>
                            <p class="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                            <p class="font-semibold mt-3 text-blue-600">Token: {order.token}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold">Rs. {order.totalPrice.toFixed(2)}</p>
                            <p class="text-sm px-2 py-1 rounded-full {
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }">
                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                            </p>
                        </div>
                    </div>
                    <div class="mt-2 text-sm text-gray-600">
                        <p>{order.foodItems.length} items</p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div> 