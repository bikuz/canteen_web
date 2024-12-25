<script>
    import { onMount } from 'svelte';
    import * as api from '../services/apiHandler';

    let foodItems = [];
    let categories = [];
    let containerRef;
    let scrollInterval;
    const SCROLL_SPEED = 2;
    const PAUSE_DURATION = 5000;
    let scrollingDown = true;

    function setupAutoScroll() {
        console.log('Setting up auto scroll');
        if (!containerRef) {
            console.log('Container ref not found');
            return;
        }

        // Clear any existing interval
        if (scrollInterval) {
            clearInterval(scrollInterval);
        }

        scrollInterval = setInterval(() => {
            const maxScroll = containerRef.scrollHeight - containerRef.clientHeight;
            console.log('Current scroll:', containerRef.scrollTop, 'Max scroll:', maxScroll, 'Direction:', scrollingDown ? 'down' : 'up');

            if (scrollingDown) {
                containerRef.scrollTop += SCROLL_SPEED;
                if (containerRef.scrollTop >= maxScroll) {
                    console.log('Reached bottom');
                    clearInterval(scrollInterval);
                    setTimeout(() => {
                        scrollingDown = false;
                        setupAutoScroll();
                    }, PAUSE_DURATION);
                }
            } else {
                containerRef.scrollTop -= SCROLL_SPEED;
                if (containerRef.scrollTop <= 0) {
                    console.log('Reached top');
                    clearInterval(scrollInterval);
                    setTimeout(() => {
                        scrollingDown = true;
                        setupAutoScroll();
                    }, PAUSE_DURATION);
                }
            }
        }, 50);
    }

    onMount(async () => {
        console.log('Component mounted');
        try {
            await api.getItems({
                endPoint: 'menus/day/Sunday/fooditems',
                onSuccess: (data) => {
                    console.log('Data received:', data.length, 'items');
                    foodItems = data;
                    categories = [...new Set(data.map(item => item.category))];
                    
                    // Wait for the next tick to ensure DOM is updated
                    setTimeout(() => {
                        if (containerRef) {
                            console.log('Starting auto scroll');
                            setupAutoScroll();
                        }
                    }, 1000);
                }
            });
        } catch (error) {
            console.error('Failed to load food items:', error);
        }

        return () => {
            if (scrollInterval) {
                clearInterval(scrollInterval);
            }
        };
    });
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Header (Fixed) -->
    <div class="text-center py-6 bg-gradient-to-br from-gray-900 to-gray-800 sticky top-0 z-10">
        <h1 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Today's Menu
        </h1>
    </div>

    <!-- Scrollable Content -->
    <div 
        bind:this={containerRef} 
        class="overflow-y-auto h-[calc(100vh-12rem)] relative"
    >
        <div class="absolute inset-x-0">
            <!-- Categories and Items -->
            {#each categories as category}
                <div class="mb-8 px-8">
                    <h2 class="text-3xl font-bold mb-6 text-orange-400 border-b border-orange-400 pb-2 sticky top-0 bg-gray-900/95 backdrop-blur-sm">
                        {category.name}
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {#each foodItems.filter(item => item.category._id === category._id) as item}
                            <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-gray-700">
                                <div class="p-4">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-2xl font-bold text-white">{item.name}</h3>
                                        <span class="bg-orange-500 text-white px-4 py-1 rounded-full text-xl font-bold">
                                            Rs. {item.price}
                                        </span>
                                    </div>
                                    {#if item.description}
                                        <p class="text-gray-300 text-lg">{item.description}</p>
                                    {/if}
                                    {#if item.tags && item.tags.length > 0}
                                        <div class="mt-3 flex flex-wrap gap-2">
                                            {#each item.tags as tag}
                                                <span class="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                                                    {tag}
                                                </span>
                                            {/each}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Footer -->
    <div class="text-center py-4 bg-gradient-to-br from-gray-900 to-gray-800 sticky bottom-0 z-10">
        <p class="text-gray-400 text-xl">Menu updated daily • All prices are inclusive of taxes</p>
    </div>
</div>

<style>
    /* Make text more readable for wall display */
    :global(body) {
        font-size: 16px;
        line-height: 1.5;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    /* Ensure proper scrolling */
    .overflow-y-auto {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        overflow-y: scroll !important;
        position: relative;
    }

    /* Remove any hover effects since there's no mouse interaction */
    * {
        transition: none !important;
    }
</style> 