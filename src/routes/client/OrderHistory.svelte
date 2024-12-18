<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { getItems, postItems } from '../../services/apiHandler';
    import { navigate } from 'svelte-routing';

    let orders = [];
    let isLoading = true;

    onMount(async () => {
        try {
            await getItems(
                {
                    endPoint: 'orders/history',
                    onSuccess: (response) => {
                        orders = response;
                    }
                }
            );
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            alert('Failed to load orders. Please try again later.');
        } finally {
            isLoading = false;
        }
    });

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function viewOrderDetails(orderId) {
        navigate(`/client/orderDetail/${orderId}`);
    }
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-xl font-bold mb-4">Order History</h1>

    {#if isLoading}
        <div class="text-center py-8 bg-white rounded-lg shadow">
            <p class="text-gray-500">Loading orders...</p>
        </div>
    {:else if orders.length === 0}
        <div class="text-center py-8 bg-white rounded-lg shadow" transition:fade>
            <p class="text-gray-500">No orders found</p>
        </div>
    {:else}
        <div class="space-y-4">
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            {#each orders as order}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div 
                    class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    on:click={() => viewOrderDetails(order._id)}
                    transition:slide
                >
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold">Order #{order.token}</p>
                            <p class="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold">Rs. {order.totalPrice.toFixed(2)}</p>
                            <p class="text-sm px-2 py-1 rounded-full {
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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