<script>
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    export let selectedOrder;
    import { createEventDispatcher } from "svelte";
  
    const dispatch = createEventDispatcher();
  
    function closePanel() {
      dispatch("close");
    }
</script>

<!-- Overlay -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="fixed inset-0 bg-black bg-opacity-50 z-40"
    on:click={closePanel}
></div>

<!-- Slide Panel -->
<div
    class="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white z-50 shadow-xl"
    transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}
>
    <div class="h-full overflow-y-auto">
        <div class="p-6">
            <!-- Close Button -->
            <button 
                class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                on:click={closePanel}
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <!-- Order Details -->
            <div class="space-y-6 mt-8">
                <h2 class="text-2xl font-bold">Order #{selectedOrder.id}</h2>
                
                <!-- Customer Info -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-2">Customer Information</h3>
                    <p class="text-gray-600">Customer: {selectedOrder.customer}</p>
                </div>

                <!-- Order Info -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-2">Order Information</h3>
                    <div class="space-y-2">
                        <p class="text-gray-600">Date: {selectedOrder.date}</p>
                        <p class="text-gray-600">Payment Type: {selectedOrder.paymentType}</p>
                        <p class="text-gray-600">Status: 
                            <span class="px-2 py-1 rounded-full text-sm {
                                selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }">
                                {selectedOrder.status}
                            </span>
                        </p>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-lg mb-2">Order Items</h3>
                    <div class="space-y-2">
                        <!-- Add order items here when available in the data -->
                        <p class="text-gray-600">Items will be displayed here</p>
                    </div>
                </div>

                <!-- Total -->
                <div class="border-t pt-4">
                    <div class="flex justify-between items-center text-xl font-bold">
                        <span>Total Amount</span>
                        <span>Rs. {selectedOrder.total}</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                {#if selectedOrder.status === 'Pending'}
                    <div class="flex space-x-4 pt-4">
                        <button 
                            class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Complete Order
                        </button>
                        <button 
                            class="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Cancel Order
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
  