<script>
    import { onMount } from 'svelte';
    import * as api from '../services/apiHandler';

    let foodItems = [];
    let categories = [];
    let currentPage = 0;
    let totalPages = 0;
    let itemsPerPage = 15;
    let interval;
    let isLoading = true;
    const DISPLAY_DURATION = 6000;

    // Group items by category
    $: itemsByCategory = categories.reduce((acc, cat) => {
        acc[cat._id] = foodItems.filter(item => item.category._id === cat._id);
        return acc;
    }, {});

    $: {
        // Calculate total items and pages
        const totalItems = foodItems.length;
        totalPages = Math.ceil(totalItems / itemsPerPage);
    }

    function getItemsForPage(pageNum) {
        if (foodItems.length === 0) return [];
        
        // Get all categories for this page
        const categoriesForPage = categories.slice(
            pageNum * 3, 
            (pageNum * 3) + 3
        );

        // Get items for these categories
        return categoriesForPage.map(cat => ({
            category: cat,
            items: itemsByCategory[cat._id] || []
        }));
    }

    function startRotation() {
        if (interval) clearInterval(interval);
        
        interval = setInterval(() => {
            currentPage = (currentPage + 1) % Math.ceil(categories.length / 3);
        }, DISPLAY_DURATION);
    }

    onMount(async () => {
        try {
            await api.getItems({
                endPoint: 'menus/today/fooditems',
                onSuccess: (data) => {
                    foodItems = data;
                    // Extract unique categories using Set and map
                    categories = Array.from(new Set(data.map(item => 
                        JSON.stringify(item.category)
                    ))).map(cat => JSON.parse(cat));
                    
                    isLoading = false;
                    startRotation();
                }
            });
        } catch (error) {
            console.error('Failed to load food items:', error);
            isLoading = false;
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    });
</script>

<div class="min-h-screen bg-white text-gray-800">
    <!-- Header -->
    <div class="py-8 text-center bg-gradient-to-r from-blue-600 to-purple-600">
        <h1 class="text-5xl font-bold text-white mb-2">Today's Menu</h1>
        <p class="text-blue-100">Fresh and Delicious</p>
    </div>

    <!-- Menu Content -->
    {#if isLoading}
        <div class="flex justify-center items-center h-[calc(100vh-12rem)]">
            <p class="text-2xl text-gray-600">Loading menu...</p>
        </div>
    {:else}
        <div class="container mx-auto px-4 py-8 transition-all duration-500">
            <div class="grid grid-cols-3 gap-8">
                {#each getItemsForPage(currentPage) as {category, items}}
                    <div class="space-y-6">
                        <!-- Category Header -->
                        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg shadow-lg">
                            <h2 class="text-2xl font-bold text-white text-center">
                                {category.name}
                            </h2>
                        </div>

                        <!-- Items in Category -->
                        {#each items as item}
                            <div class="border-b border-gray-200 pb-4 group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                <div class="flex justify-between items-start">
                                    <div class="flex gap-4 items-start">
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            class="w-12 h-12 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h3 class="text-xl font-bold text-gray-800 mb-1">{item.name}</h3>
                                            {#if item.description}
                                                <p class="text-gray-600 mt-2 text-sm">{item.description}</p>
                                            {/if}
                                            {#if item.tags && item.tags.length > 0}
                                                <div class="flex flex-wrap gap-2 mt-2">
                                                    {#each item.tags as tag}
                                                        <span class="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                                                            {tag}
                                                        </span>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                    <span class="text-lg font-bold text-blue-600">Rs. {item.price}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Footer -->
    <div class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-4">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <p class="text-gray-600">All prices include taxes</p>
            <div class="flex gap-2">
                {#each Array(Math.ceil(categories.length / 3)) as _, i}
                    <div class="w-2 h-2 rounded-full transition-colors duration-300 
                        {currentPage === i ? 'bg-blue-600' : 'bg-gray-300'}">
                    </div>
                {/each}
            </div>
            <p class="text-gray-600">Menu updated daily</p>
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    .transition-all {
        transition: all 0.5s ease-in-out;
    }
</style> 