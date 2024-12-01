<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as api from '../services/apiHandler';
    // import {imageUpload} from '../services/imgHandler'
    // import {secondsToTime12,secondsToTime24, timeToSeconds} from '../services/dateTimeHandler'
    import Header from '../partials/order/Header.svelte';
    import OrderList from '../partials/order/OrderList.svelte';
    import OrderDetails from '../partials/order/OrderDetails.svelte';

    let selectedOrder = null;

    // Sample order data
    const orders = [
        { id: 1, customer: "Ram", date: "2024-12-01", status: "Pending", paymentType: "Credit Card", total: "120.00" },
        { id: 2, customer: "Hari", date: "2024-12-01", status: "Completed", paymentType: "Cash", total: "340.00" },
        { id: 3, customer: "Gita", date: "2024-11-30", status: "Cancelled", paymentType: "Other", total: "50.00" },
    ];

    // Filters
    let startDate = "";
    let endDate = "";
    let statusFilter = "";
    let paymentTypeFilter = "";
    let categoryFilter = "";

    // Function to update filter values when search button is clicked
    function searchOrders(filters) {
        ({ startDate, endDate, status: statusFilter, paymentType: paymentTypeFilter, category: categoryFilter } = filters);
    }

    // Reactive filtered orders list
    $: filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        return (
        (!start || orderDate >= start) &&
        (!end || orderDate <= end) &&
        (!statusFilter || order.status === statusFilter) &&
        (!paymentTypeFilter || order.paymentType === paymentTypeFilter) &&
        (!categoryFilter || order.category === categoryFilter)
        );
    });

    function selectOrder(order) {
        selectedOrder = order;
    }

    // Computed counts for cards
    $: totalOrders = orders.length;
    $: pendingOrders = orders.filter(order => order.status === "Pending").length;
    $: completedOrders = orders.filter(order => order.status === "Completed").length;
    $: cancelledOrders = orders.filter(order => order.status === "Cancelled").length;

</script>



<!-- Category List -->
<div class="container mx-auto p-6 flex flex-col space-y-6 bg-gray-50 h-full">
    <!-- Button Section -->
    <div class="flex items-center justify-between">
        <Header on:searchOrders={searchOrders} />
        
    </div>

    <!-- Summary Cards Section -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div class="bg-blue-100 border border-blue-300 rounded-md p-4">
        <h3 class="text-blue-700 font-bold text-lg">Total Orders</h3>
        <p class="text-blue-900 text-2xl font-semibold">{totalOrders}</p>
        </div>
        <div class="bg-yellow-100 border border-yellow-300 rounded-md p-4">
        <h3 class="text-yellow-700 font-bold text-lg">Pending Orders</h3>
        <p class="text-yellow-900 text-2xl font-semibold">{pendingOrders}</p>
        </div>
        <div class="bg-green-100 border border-green-300 rounded-md p-4">
        <h3 class="text-green-700 font-bold text-lg">Completed Orders</h3>
        <p class="text-green-900 text-2xl font-semibold">{completedOrders}</p>
        </div>
        <div class="bg-red-100 border border-red-300 rounded-md p-4">
        <h3 class="text-red-700 font-bold text-lg">Cancelled Orders</h3>
        <p class="text-red-900 text-2xl font-semibold">{cancelledOrders}</p>
        </div>
    </div>

    <!-- Categories Section -->
    <div class="overflow-auto pr-4 ">
        <OrderList orders={filteredOrders} on:selectOrder={selectOrder} />
    
        <!-- Slide-in Panel -->
        {#if selectedOrder}
        <OrderDetails {selectedOrder} on:close={() => (selectedOrder = null)} />
        {/if}
        

        
    </div>
</div>