<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as api from '../../services/apiHandler';
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { cart } from '../../stores/cartStore';
    import { Rss } from 'svelte-hero-icons';

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let todayIndex = new Date().getDay();
    let selectedDay = days[todayIndex];
    let foodItems = [];
    let selectedItem = null;
    let selectedCategory = 'all';

    // Store to handle loading state
    const isLoading = writable(false);

    // Use writable for categories
    const categories = writable([]);

    // const fetchCategory = async (categoryId) => {
    //     await api.getItems({
    //         endPoint: `categories/${categoryId}`,
    //         onSuccess: (category) => {
    //             categories.update(currentCategories => {
    //                 // Check if the category already exists
    //                 const exists = currentCategories.some(cat => cat._id === category._id);
    //                 if (!exists) {
    //                     return [...currentCategories, category];
    //                 }
    //                 return currentCategories;
    //             });
    //         },
    //         onError: (error) => {
    //             console.error('Failed to fetch category:', error);
    //         }
    //     });
    // };

    const fetchFoodItems = async (day) => {
        isLoading.set(true);
        await api.getItems({
            endPoint: `menus/day/${day}/fooditems`,
            onSuccess: (items) => {
                foodItems = items;
                // Extract unique categories from the food items
                const uniqueCategories = [];
                const categoryIds = new Set();

                items.forEach(item => {
                    const category = item.category;
                    if (!categoryIds.has(category._id)) {
                        categoryIds.add(category._id);
                        uniqueCategories.push(category);
                    }
                });

                console.log('Unique categories:', uniqueCategories); // Debugging
                categories.set(uniqueCategories);
            },
            onError: (error) => {
                console.error('Failed to fetch food items:', error);
            },
            onFinally: () => {
                isLoading.set(false);
            }
        });
    };

    const selectDay = (day) => {
        if (selectedDay === day) {
            selectedDay = '';
            foodItems = [];
           
        } else {
            selectedDay = day;
            // categories.set([]); // Clear categories before fetching new ones
            fetchFoodItems(day);
        }
        categories.set([]); // Clear categories
    };

    // Group food items by category
    $: groupedFoodItems = foodItems.reduce((groups, item) => {
        if (selectedCategory === 'all' || item.category._id === selectedCategory) {
            const categoryId = item.category._id;
            if (!groups[categoryId]) {
                groups[categoryId] = [];
            }
            groups[categoryId].push(item);
        }
        return groups;
    }, {});

    // Function to get category name by ID
    function getCategoryNameById(categoryId) {
        const category = $categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Unknown Category';
    }

    // Fetch initial data for Sunday
    onMount(() => {
        fetchFoodItems(selectedDay);
    });

    function showItemDetail(item) {
        selectedItem = item;
    }

    function closeDetail() {
        selectedItem = null;
    }

    function addToCart(item) {
        cart.addItem(item);
        // Optional: Show a success message
        showNotification(`${item.name} added to cart!`);
        closeDetail();
    }

    // Optional: Add a notification system
    let notification = null;
    function showNotification(message) {
        notification = message;
        setTimeout(() => {
            notification = null;
        }, 3000);
    }

    function filterByCategory(category) {
        selectedCategory = category;
    }
</script>

<div class="container mx-auto p-4 pt-2 pb-2 flex flex-col space-y-6 bg-gray-50 h-full relative">
    <!-- Pills Section -->
    <div class="flex justify-between items-center space-x-2 bg-gray-100 p-4 rounded-lg">
        <div class="flex items-center w-full space-x-2 overflow-x-auto">
            {#each days as day, index}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="flex-grow text-center py-2 px-4 rounded-full font-semibold cursor-pointer 
                    {selectedDay === day 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}"
                    on:click={() => selectDay(day)}
                >
                    {#if todayIndex === index}
                        <span>Today <i class="text-sm">({day})</i></span>
                    {:else}
                        {day}
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <!-- Category Filter Buttons -->
    {#if $categories.length > 0}
        <div class="flex space-x-2 mb-4 justify-center">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div 
                class="px-3 py-1 bg-yellow-50 rounded-full text-yellow-700 shadow
                transition-all duration-200 hover:bg-yellow-100 cursor-pointer
                 {selectedCategory === 'all' ? 'ring-2 ring-yellow-400' : ''}"
                on:click={() => filterByCategory('all')}
            >
                All
            </div>
            {#each $categories as category}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div 
                    class="px-3 py-1 bg-yellow-50 rounded-full text-yellow-700 shadow
                    transition-all duration-200 hover:bg-yellow-100 cursor-pointer
                    {selectedCategory === category._id ? 'ring-2 ring-yellow-400' : ''}"
                    on:click={() => filterByCategory(category._id)}
                >
                    {category.name}
                </div>
            {/each}
        </div>
    {:else}
        <div class="text-center">No categories available for this day.</div>
    {/if}

    <!-- Food Items Section -->
    <div class="space-y-2 overflow-y-auto h-full">
        {#if $isLoading}
            <div class="text-center">Loading...</div>
        {:else if foodItems.length === 0}
            <div class="text-center">No food items available for this day.</div>
        {:else}
            {#each Object.entries(groupedFoodItems) as [categoryId, items]}
                <div class="space-y-2">
                    <h2 class="text-lg font-bold text-gray-800 border-b pb-2">
                        {#if $categories.length > 0}
                            {getCategoryNameById(categoryId)}
                        {:else}
                            Loading...
                        {/if}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {#each items as item}
                            <!-- svelte-ignore a11y-click-events-have-key-events -->
                            <!-- svelte-ignore a11y-no-static-element-interactions -->
                            <div 
                                class="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                on:click={() => showItemDetail(item)}
                            >
                                <div class="h-24 w-full">
                                    {#if item.image}
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            class="h-full w-full object-cover"
                                            onerror="this.src='placeholder-image-url.jpg'"
                                        />
                                    {:else}
                                        <div class="h-full w-full bg-gray-200 flex items-center justify-center">
                                            <span class="text-gray-400 text-sm">No image</span>
                                        </div>
                                    {/if}
                                </div>
                                <div class="p-3">
                                    <h3 class="text-base font-semibold">{item.name}</h3>
                                    <p class="text-gray-600 text-xs mt-1">{item.description}</p>
                                    <p class="text-blue-600 font-medium mt-1">Rs. {item.price}</p>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>

    <!-- Item Detail Slide Panel -->
    {#if selectedItem}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div 
            class="fixed inset-0 bg-black bg-opacity-50 z-40"
            on:click={closeDetail}
        ></div>
        <div
            class="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-white z-50 shadow-xl"
            transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}
        >
            <div class="h-full overflow-y-auto">
                <div class="p-6">
                    <!-- Close Button -->
                    <button 
                        class="absolute top-4 right-4 bg-red-600 text-gray-50 hover:text-gray-700"
                        on:click={closeDetail}
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Item Details -->
                    <div class="space-y-6">
                        <div class="h-64 w-full">
                            {#if selectedItem.image}
                                <img 
                                    src={selectedItem.image} 
                                    alt={selectedItem.name}
                                    class="h-full w-full object-cover rounded-lg"
                                />
                            {:else}
                                <div class="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span class="text-gray-400">No image available</span>
                                </div>
                            {/if}
                        </div>

                        <div class="space-y-4">
                            <h2 class="text-2xl font-bold">{selectedItem.name}</h2>
                            <p class="text-gray-600">{selectedItem.description}</p>
                            <p class="text-2xl font-bold text-blue-600">Rs. {selectedItem.price}</p>

                            <!-- Action Buttons -->
                            <div class="flex space-x-4 pt-4">
                                {#if selectedDay === days[todayIndex]}
                                    <button 
                                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                                        on:click={() => addToCart(selectedItem)}
                                    >
                                        Add to Cart
                                    </button>
                                <!-- {:else}
                                    <div class="flex-1 text-center text-gray-600">
                                        Not available today
                                    </div> -->
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Add notification display -->
    {#if notification}
        <div 
            class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
            transition:slide
        >
            {notification}
        </div>
    {/if}
</div>
