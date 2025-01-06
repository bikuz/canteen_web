<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { getItems, postItems, patchItem } from '../../services/apiHandler';
    import { navigate } from 'svelte-routing';

    export let orderId;
    let order = null;
    let isLoading = true;
    let showCancelDialog = false;
    let cancelReason = '';

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
        navigate('/client/orderHistory');
    }

    async function cancelOrder() {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        try {
            await patchItem(
                { cancelReason: cancelReason.trim() },
                {
                    // contentType: 'multipart/form-data',
                    endPoint: `orders/cancel/${orderId}`,                    
                    onSuccess: (response) => {
                        if(response.success){
                            order = { ...order, paymentStatus: 'cancelled' };
                            showCancelDialog = false;
                            cancelReason = '';
                            alert('Order cancelled successfully');
                        }
                        else{
                            alert(response.message);
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

    function showCancelPrompt() {
        showCancelDialog = true;
    }
</script>

<div class="container mx-auto p-4 max-w-4xl ">
    <button 
        class="p-3 mb-2 flex items-center bg-blue-500 text-gray-50 rounded-lg
         hover:text-blue-800 hover:bg-slate-200 transition-all duration-300 ease-in-out"
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
        <div class="bg-white rounded-lg shadow p-4 flex flex-col max-h-[calc(100vh-10rem)]" transition:fade>
            <!-- Fixed Top Section -->
            <div class="border-b pb-4 mb-4 flex-shrink-0">
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-xl font-bold">#{order.shortId}</h1>
                        <p class="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        <h1 class="text-xl font-bold mt-3 text-blue-600">Token: {order.token}</h1>
                    </div>
                    <div class="text-right flex flex-col gap-2">
                        <p class="text-sm px-3 py-1 rounded-full {
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }">
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </p>
                        
                        {#if order.isCancelAllowed && order.paymentStatus !== 'cancelled'}
                            <button 
                                class="text-sm px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                on:click={showCancelPrompt}
                            >
                                Cancel Order
                            </button>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Scrollable Content -->
            <div class="flex-grow overflow-y-auto">
                <!-- Order Items -->
                <div class="flex flex-col space-y-4">
                    {#each order.foodItems as item, index}
                        <div class="flex items-center space-x-4">
                            <div class="flex-grow">
                                <h3 class="font-semibold">{item.name}</h3>
                                <p class="text-sm text-gray-600">Rs. {item.price} × {order.quantities[index]}</p>
                            </div>
                            <div class="text-right pr-4">
                                <p class="font-semibold">Rs. {(item.price * order.quantities[index]).toFixed(2)}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <!-- Fixed Bottom Section -->
            <div class="mt-6 pt-4 border-t flex-shrink-0">
                <div class="flex justify-between items-center font-bold">
                    <p>Total Amount</p>
                    <p>Rs. {order.totalPrice.toFixed(2)}</p>
                </div>
                <p class="text-sm text-gray-600 mt-2">Payment Method: <strong>{order.paymentMethod}</strong></p>
            </div>
        </div>
    {/if}

    {#if showCancelDialog}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 class="text-xl font-bold mb-4">Cancel Order</h2>
                <p class="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
                
                <textarea
                    bind:value={cancelReason}
                    class="w-full p-2 border rounded-lg mb-4 h-32 resize-none"
                    placeholder="Enter cancellation reason..."
                ></textarea>
                
                <div class="flex justify-end space-x-4">
                    <button 
                        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        on:click={() => {
                            showCancelDialog = false;
                            cancelReason = '';
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        on:click={cancelOrder}
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div> 