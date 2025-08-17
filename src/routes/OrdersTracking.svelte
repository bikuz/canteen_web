<script>
    import { onMount, onDestroy } from 'svelte';
    import { getItems } from '../services/apiHandler';

    let foodItems = [];
    let categories = []; // Store categories fetched from API
    let selectedCategory = 'All';
    let isLoading = true;
    let lastUpdated = new Date();
    let refreshInterval;
    let selectedDate = new Date().toISOString().split('T')[0]; // Today's date as default

    // Auto-refresh every 30 seconds for live updates
    const REFRESH_INTERVAL = 30000;

    onMount(() => {
        fetchCategories();
        fetchOrderData();
        // Set up auto-refresh
        refreshInterval = setInterval(() => {
            fetchOrderData();
        }, REFRESH_INTERVAL);
    });

    onDestroy(() => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
    });

    async function fetchCategories() {
        try {
            await getItems({
                endPoint: 'categories',
                onSuccess: (data) => {
                    categories = data;
                },
                onError: (error) => {
                    console.error('Failed to fetch categories:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    async function fetchOrderData() {
        try {
            isLoading = true;
            
            // Use selected date for fetching orders
            const startDate = selectedDate;
            const endDate = selectedDate;

            // Fetch orders for selected date
            await getItems({
                endPoint: `orders?startDate=${startDate}&endDate=${endDate}`,
                onSuccess: (orders) => {
                    processOrderData(orders);
                    lastUpdated = new Date();
                },
                onError: (error) => {
                    console.error('Failed to fetch orders:', error);
                }
            });
        } catch (error) {
            console.error('Error fetching order data:', error);
        } finally {
            isLoading = false;
        }
    }

    function processOrderData(orders) {
        // Create a map to aggregate order quantities by food item
        const itemOrderMap = new Map();

        orders.forEach(order => {
            // Only process orders that are not cancelled
            if (order.status !== 'cancelled') {
                order.foodItems.forEach((item, index) => {
                    const quantity = order.quantities[index] || 1;
                    const itemKey = item._id;
                    
                    // Find the category name by matching the category ID
                    let categoryName = 'Uncategorized';
                    if (item.category) {
                        const category = categories.find(cat => cat._id === item.category);
                        categoryName = category ? category.name : 'Uncategorized';
                    }
                    
                    if (itemOrderMap.has(itemKey)) {
                        const existing = itemOrderMap.get(itemKey);
                        existing.orders += quantity;
                        existing.totalRevenue += (item.price * quantity);
                    } else {
                        itemOrderMap.set(itemKey, {
                            id: item._id,
                            name: item.name,
                            image: item.image, // Use the actual image from the food item
                            orders: quantity,
                            category: categoryName,
                            price: item.price,
                            totalRevenue: item.price * quantity
                        });
                    }
                });
            }
        });

        // Convert map to array and sort by order count
        foodItems = Array.from(itemOrderMap.values())
            .sort((a, b) => b.orders - a.orders);
    }
    
    function formatCurrency(amount) {
        return `Rs. ${amount.toFixed(2)}`;
    }

    // Calculate total orders and stats
    $: totalOrders = foodItems.reduce((sum, item) => sum + item.orders, 0);
    $: totalRevenue = foodItems.reduce((sum, item) => sum + item.totalRevenue, 0);
    $: averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group items by category
    $: groupedItems = foodItems.reduce((groups, item) => {
        const category = item.category;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(item);
        return groups;
    }, {});

    // Get unique categories from processed data
    $: categoryNames = ['All', ...Object.keys(groupedItems).sort()];

    // Filter items based on selected category
    $: filteredGroupedItems = selectedCategory === 'All' 
        ? groupedItems 
        : { [selectedCategory]: groupedItems[selectedCategory] || [] };

    // Category colors for visual distinction
    const categoryColors = {
        'Pizza': 'from-red-500 to-orange-500',
        'Burgers': 'from-yellow-500 to-orange-600',
        'Pasta': 'from-green-500 to-teal-500',
        'Salads': 'from-green-400 to-emerald-500',
        'Mexican': 'from-pink-500 to-red-500',
        'Desserts': 'from-purple-500 to-pink-500',
        'Asian': 'from-blue-500 to-indigo-500',
        'Beverages': 'from-cyan-500 to-blue-500',
        'Snacks': 'from-orange-400 to-red-500',
        'Uncategorized': 'from-gray-500 to-gray-600'
    };

    // Manual refresh function
    function manualRefresh() {
        fetchOrderData();
    }

    // Handle date change
    function handleDateChange() {
        fetchOrderData();
    }

    // Quick date navigation functions
    function goToToday() {
        selectedDate = new Date().toISOString().split('T')[0];
        fetchOrderData();
    }

    function goToPreviousDay() {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        selectedDate = date.toISOString().split('T')[0];
        fetchOrderData();
    }

    function goToNextDay() {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        selectedDate = date.toISOString().split('T')[0];
        fetchOrderData();
    }
</script>

<div class="min-h-screen max-h-screen overflow-y-auto bg-white">
    <!-- Compact Fixed Header -->
    <div class="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 z-40">
        <div class="max-w-7xl mx-auto px-4 py-2">
            <!-- Compact Title and Date Row -->
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-4">
                    <h1 class="text-xl font-bold text-black">
                        🍽️ Order Tracking
                    </h1>
                    <div class="text-sm text-gray-600">
                        {selectedDate === new Date().toISOString().split('T')[0] 
                            ? 'Live tracking' 
                            : new Date(selectedDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                            })
                        }
                    </div>
                </div>
                
                <!-- Compact Controls -->
                <div class="flex items-center gap-2">
                    <button 
                        class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                        on:click={goToPreviousDay}
                        disabled={isLoading}
                        title="Previous Day"
                    >
                        ←
                    </button>
                    
                    <input
                        type="date"
                        bind:value={selectedDate}
                        on:change={handleDateChange}
                        class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        max={new Date().toISOString().split('T')[0]}
                    />
                    
                    <button 
                        class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                        on:click={goToNextDay}
                        disabled={isLoading || selectedDate === new Date().toISOString().split('T')[0]}
                        title="Next Day"
                    >
                        →
                    </button>
                    
                    <button 
                        class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                        on:click={goToToday}
                        disabled={isLoading || selectedDate === new Date().toISOString().split('T')[0]}
                        title="Today"
                    >
                        Today
                    </button>
                    
                    <button 
                        class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                        on:click={manualRefresh}
                        disabled={isLoading}
                        title="Refresh"
                    >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        {isLoading ? '...' : 'Refresh'}
                    </button>
                </div>
            </div>

            <!-- Compact Stats Row -->
            <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
                <div class="flex items-center gap-4">
                    <span>Total: {totalOrders} items</span>
                    <span>Revenue: {formatCurrency(totalRevenue)}</span>
                    <span>Items: {foodItems.length}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                    <span>Auto-refresh: {Math.floor(REFRESH_INTERVAL / 1000)}s</span>
                </div>
            </div>

            <!-- Compact Category Filter Tabs -->
            <div class="flex flex-wrap gap-1 mb-1">
                {#each categoryNames as category}
                    <button
                        class="px-2 py-1 rounded text-sm font-medium transition-all duration-300 {selectedCategory === category 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                        on:click={() => selectedCategory = category}
                    >
                        {category}
                        <span class="ml-1 px-1 py-0.5 rounded text-sm {selectedCategory === category 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-200 text-gray-600'}">
                            {category === 'All' ? totalOrders : (groupedItems[category] || []).reduce((sum, item) => sum + item.orders, 0)}
                        </span>
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <!-- Loading State -->
    {#if isLoading && foodItems.length === 0}
        <div class="flex items-center justify-center min-h-[50vh]">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading order data...</p>
            </div>
        </div>
    {:else if foodItems.length === 0}
        <div class="flex items-center justify-center min-h-[50vh]">
            <div class="text-center">
                <div class="text-6xl mb-4">🍽️</div>
                <p class="text-gray-600 text-lg">No orders found for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                <p class="text-gray-500">Orders will appear here if they exist for the selected date</p>
            </div>
        </div>
    {:else}
        <!-- Scrollable Content -->
        <div class="max-w-7xl mx-auto px-4 pb-8">

            <!-- Food Items by Category -->
            {#each Object.entries(filteredGroupedItems) as [category, items]}
                <div class="mb-12">
                    <!-- Category Header -->
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold text-black text-left">
                            {category}
                            <span class="text-lg text-gray-500 ml-2">
                                ({items.reduce((sum, item) => sum + item.orders, 0)} items to prepare)
                            </span>
                        </h2>
                    </div>

                    <!-- Enhanced Items Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {#each items as item (item.id)}
                            <div class="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-blue-200/50 overflow-hidden">
                                <!-- Enhanced Image Section -->
                                <div class="relative h-36 overflow-hidden">
                                                                         
                                     {#if item.image}
                                        <img class="object-cover w-full h-full"
                                        src={item.image} 
                                        alt="{item.name}" />
                                    {:else}
                                        <div class="flex items-center justify-center h-full text-gray-400 italic">
                                            No Image
                                        </div>
                                    {/if}
                                    <!-- <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 group-hover:from-black/50 transition-all duration-500"></div> -->
                                    
                                    <!-- Priority Badge for high order items -->
                                    {#if item.orders >= 10}
                                        <div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            HIGH PRIORITY
                                        </div>
                                    {/if}
                                </div>

                                <!-- Enhanced Content Section -->
                                <div class="p-5">
                                    <p class="text-sm text-gray-500 mb-2">{item.category}</p>
                                    <h3 class="text-lg font-bold text-black mb-3 group-hover:text-blue-600 transition-colors truncate">
                                        {item.name}
                                    </h3>
                                    
                                    <!-- Enhanced Orders Display -->
                                    <div class="flex items-center justify-between mb-4">
                                        <div class="flex items-center space-x-3">
                                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                                </svg>
                                            </div>
                                            <div>
                                                <p class="text-xl font-bold text-black">{item.orders}</p>
                                                <p class="text-xs text-gray-500">Orders</p>
                                            </div>
                                        </div>

                                        <!-- Price Display -->
                                        <div class="text-right">
                                            <p class="text-sm font-semibold text-green-600">{formatCurrency(item.price)}</p>
                                            <p class="text-xs text-gray-500">per item</p>
                                        </div>
                                    </div>

                                    <!-- Order Volume Progress Bar -->
                                    <div class="mb-4">
                                        <div class="flex justify-between text-xs text-gray-500 mb-2">
                                            <span>Order Volume</span>
                                            <span class="text-blue-600 font-semibold">{Math.round((item.orders / totalOrders) * 100)}%</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div 
                                                class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-1000 shadow-sm"
                                                style="width: {(item.orders / totalOrders) * 100}%"
                                            ></div>
                                        </div>
                                    </div>

                                    <!-- Revenue for this item -->
                                    <div class="text-center p-2 bg-green-50 rounded-lg">
                                        <p class="text-sm text-green-700 font-semibold">
                                            Revenue: {formatCurrency(item.totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}

            <!-- Enhanced Footer -->
            <!-- <div class="text-center mt-20 py-12 bg-gray-50 rounded-3xl border border-gray-200 backdrop-blur-sm">
                <div class="text-4xl mb-4">📊</div>
                <p class="text-gray-600 text-lg font-medium">Kitchen Dashboard</p>
                <p class="text-black font-bold text-xl">Last updated: {lastUpdated.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                <div class="mt-4 flex justify-center space-x-2">
                    <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
            </div> -->
        </div>
    {/if}
</div>