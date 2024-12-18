<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { getItems, postItems, updateItem } from '../../services/apiHandler';
    import { navigate } from 'svelte-routing';

    export let orderId;
    let order = null;
    let isLoading = true;

    onMount(async () => {
        try {

            await getItems(
                {
                    endPoint: `orders/orderDetail/${orderId}`,
                    onSuccess: (response) => {
                        order = response;
                    }
                }
            );
        } catch (error) {
            console.error('Failed to fetch order details:', error);
            alert('Failed to load order details. Please try again later.');
        } finally {
            isLoading = false;
        }
    });

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    function goBack() {
        navigate('/order-history');
    }

    async function cancelOrder() {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await updateItem(
                { orderId: order._id },
                {
                    endPoint: 'orders/cancelOrder',
                    onSuccess: (response) => {
                        if (response.success) {
                            order = { ...order, status: 'cancelled' };
                            alert('Order cancelled successfully');
                        }
                    },
                    onError: (error) => {
                        alert(error.message || 'Failed to cancel order');
                    }
                }
            );
        } catch (error) {
            console.error('Failed to cancel order:', error);
            alert('Failed to cancel order. Please try again later.');
        }
    }
</script>

<div class="container mx-auto p-4 max-w-4xl">
    <button 
        class="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        on:click={goBack}
    >
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Order History
    </button>

    {#if isLoading}
        <div class="text-center py-8 bg-white rounded-lg shadow">
            <p class="text-gray-500">Loading order details...</p>
        </div>
    {:else if !order}
        <div class="text-center py-8 bg-white rounded-lg shadow" transition:fade>
            <p class="text-gray-500">Order not found</p>
        </div>
    {:else}
        <div class="bg-white rounded-lg shadow p-6" transition:fade>
            <div class="border-b pb-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-xl font-bold">Order #{order.token}</h1>
                        <p class="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <div class="text-right flex flex-col gap-2">
                        <p class="text-sm px-3 py-1 rounded-full {
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </p>
                        
                        {#if !order.isCancelAllowed && order.status !== 'cancelled'}
                            <button 
                                class="text-sm px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                on:click={cancelOrder}
                            >
                                Cancel Order
                            </button>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="space-y-4">
                {#each order.foodItems as item, index}
                    <div class="flex items-center space-x-4">
                        <!-- <div class="w-16 h-16 flex-shrink-0">
                            {#if item.image}
                                <img 
                                    src={item.image} 
                                    alt={item.name}
                                    class="w-full h-full object-cover rounded"
                                />
                            {:else}
                                <div class="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                    <span class="text-gray-400 text-xs">No image</span>
                                </div>
                            {/if}
                        </div> -->
                        <div class="flex-grow">
                            <h3 class="font-semibold">{item.name}</h3>
                            <p class="text-sm text-gray-600">Rs. {item.price} × {order.quantities[index]}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">Rs. {(item.price * order.quantities[index]).toFixed(2)}</p>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Order Summary -->
            <div class="mt-6 pt-4 border-t">
                <div class="flex justify-between items-center font-bold">
                    <p>Total Amount</p>
                    <p>Rs. {order.totalPrice.toFixed(2)}</p>
                </div>
                <p class="text-sm text-gray-600 mt-2">Payment Method: <strong>{order.paymentMethod}</strong></p>
            </div>
        </div>
    {/if}
</div> 