<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as api from '../services/apiHandler';
    import CreateEditForm from '../partials/menu/CreateEditForm.svelte'
    import FooditemsMgmt from '../partials/menu/FooditemsMgmt.svelte';

    import {imageUpload} from '../services/imgHandler'
    import {secondsToTime12,secondsToTime24, timeToSeconds} from '../services/dateTimeHandler'

    let isCollapsed = true;
    let isPanning = false; // Track if panning is active
    let startX = 0;        // Starting X position of the mouse
    let scrollLeft = 0;    // Initial scroll position of the container

    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let todayIndex = new Date().getDay();
    let selectedDay = '';//days[todayIndex]; // Initialize with today's day
    let isEveryday = false;
    let isShowFoodPopup =false;
    // Handle pill click
    const selectDay = (day) => {
        isCollapsed = isCollapsed ? false : isCollapsed;
        selectedDay = day;
        fetchFooditemsByDay(selectedDay);
    };
    // Days of the week
    
    const [weekday, month, day, year] = new Date().toDateString().split(" ");
    const formattedDate = `${weekday}, ${month} ${day} ${year}`;

    const toggleCollapse = () => {
        isCollapsed = !isCollapsed;
    };

    function handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') { // Allow Enter or Space
            toggleCollapse();
        }
    }

    function startPan(event) {
        isPanning = true;
        startX = event.pageX - event.currentTarget.offsetLeft;
        scrollLeft = event.currentTarget.scrollLeft;
        
        // Disable text selection
        document.body.style.userSelect = 'none';
    }

    function stopPan() {
        isPanning = false;

        // Re-enable text selection
        document.body.style.userSelect = '';
    }

    function handlePan(event) {
        if (!isPanning) return;
        event.preventDefault();
        const x = event.pageX - event.currentTarget.offsetLeft;
        const walk = (x - startX) * -1; // reverse the direction
        event.currentTarget.scrollLeft = scrollLeft + walk;
    }


    export const menus=writable([]);
    let lstFooditems=[];
    let daysFooditems=[];
    let isGridView = writable(true); // Default to grid view
    let currentPage = 1; // Current active page
    let total=0;
    let totalPages = 0; // Total number of pages
    let limit = '10';
    const visiblePages = 5; // Number of pages to display
    
    let newMenu = {
        name: '',
        isAvailable: true,
        foodItems:[],
        repeatDay:[],
        tags:[]
    };

    let formErrors = {
        
    };
    let isShowForm = false;
    let isLoading = false;
    let isEditing = false;
    let editingId = null; // ID of the category being edited

    function openForm() {isShowForm=true;}
    function closeForm (){isShowForm = false;}
    function resetError(){formErrors = { name: null, timeRange: null };}
    function resetForm() {
        isEditing = false;
        editingId = null;
        isEveryday = false;
        // previewImage =null;
        newMenu = {
            name: '',
            isAvailable: true,
            foodItems:[],
            repeatDay:[],
            tags:''
        };
        closeForm();
        resetError();
    }
    function validateForm() {
        let isValid = true;

        // Reset errors
        resetError();

        // Validate category name
        if (!newMenu.name.trim()) {
            formErrors.name = 'Name field cannot be empty';
            isValid = false;
        }

        return isValid;
    }
    // Derived pages to show
    $: startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    $: endPage = Math.min(totalPages, startPage + visiblePages - 1);
    $: pagesToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
        currentPage = page;
        fetchMenus(page, limit);
        }
    };
    const updateLimit = (newLimit) => {
        limit=newLimit;
        currentPage = 1; // Reset to first page when limit changes
        fetchMenus(currentPage, limit);
    };
    
    function toggleEveryday(){
        if (isEveryday) {
            // Select all days
            newMenu.repeatDay = [...days];
        } else {
            // Deselect all days
            newMenu.repeatDay = [];
        }
    }
    // Update Everyday checkbox based on individual day selections
    function updateEverydayStatus() {
        isEveryday = newMenu.repeatDay.length === days.length;
    }

    async function fetchFoodItems() {
        await api.getItems({
            endPoint: 'fooditems',
            onSuccess: (data) => {
               lstFooditems=data;
            },
            onError: (error) => console.error('Error fetching categories:', error),
        });
    }

    async function fetchMenus(page, limit) {
        //  page/:page/limit/:limit
        await api.getItems({
            endPoint: `menus/page/${page}/limit/${limit}`,
            onSuccess: (data) => {
            menus.set(data.menus.map(m => ({
                ...m,
            })));
            total=data.total;
            totalPages = Math.ceil(total / limit); 
            },
            onError: (error) => console.error('Error fetching categories:', error),
        });
    }

    async function fetchFooditemsByDay(day) {
        //  page/:page/limit/:limit
        await api.getItems({
            endPoint: `menus/day/${day}/fooditems`,
            onSuccess: (data) => {
                daysFooditems=data; 
            },
            onError: (error) => console.error('Error fetching categories:', error),
        });
    }

    // async function fetchMenus() {
    //     await api.getItems({
    //         endPoint: 'categories',
    //         onSuccess: (data) => {
    //             const processedCategories = data.map(category => ({
    //                 ...category,
    //                 _starttime: secondsToTime12(category.orderingStartTime),
    //                 _endtime: secondsToTime12(category.orderingEndTime),
    //             }));
    //             // $categories = processedCategories;
    //             categories.set(processedCategories);
    //         },
    //         onError: (error) => console.error('Error fetching categories:', error),
    //         // onFinally : () => console.log('Fetch categories completed'),
    //     });
    // }

    

    // Create a new menu
    async function createMenu() {
        
        try {
            await api.createItem(newMenu, {
                endPoint: 'menus',
                onSuccess: (data) => {
                    menus.update((current) => [...current, data]);  
                    resetForm();
                    if(!isCollapsed)
                        fetchFooditemsByDay(selectedDay);
                },
                onError: (error) => alert(`Error: ${error.message}`),
                // onFinally : () => console.log('Create category completed.'),
            });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }

    // Update an existing category
    async function updateMenu() {
        try {
            // Extract only the _id of each food item in foodItems
            let foodItemIds = [];
            
            if(newMenu.foodItems)
                foodItemIds=newMenu.foodItems.map(item => item._id);

            await api.updateItem({ id: editingId, ...newMenu, foodItems: foodItemIds }, {
                endPoint: 'menus',
                onSuccess: (data) => {
                    menus.update((current) =>
                        current.map((m) =>
                            m._id === editingId ? data : m
                        )
                    );
                    resetForm();
                    closeFoodItems();

                    if (!isCollapsed)
                        fetchFooditemsByDay(selectedDay);
                },
                onError: (error) => alert(`Error: ${error.message}`),
            });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }

    // Set form data for editing
    function editMenu(menu) {
        isEditing = true;
        editingId = menu._id;
        newMenu = {
            name: menu.name,
            isAvailable: menu.isAvailable,
            repeatDay:menu.repeatDay,
            foodItems:menu.foodItems
        };
        updateEverydayStatus();
        openForm();
    }

    // Delete a category and remove it from the list
    async function deleteMenu(id) {
        // Ask for confirmation before deleting
        const isConfirmed = window.confirm('Are you sure you want to delete this menu?');
        
        if (!isConfirmed) {
            return; // Exit the function if the user cancels
        }

        try {
            await api.deleteItem(id, {
                endPoint: 'menus',
                onSuccess: () => {
                    menus.update((current) => current.filter((m) => m._id !== id));
                },
                onError: (error) => alert(`Error: ${error.message}`),
            });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }
    
       
    async function handleSave(){
        if(!validateForm()){
            return;
        }

        if (isEditing) {
            await updateMenu();
        } else {
            await createMenu(); 
        }
    }
    
    function editFoodItems(m){
        isShowFoodPopup=true;
        editingId = m._id;
        newMenu = {
            foodItems: m.foodItems,           
        };
    }
    function closeFoodItems(){
        isShowFoodPopup=false;
    }

    onMount(() => {
        fetchFoodItems();
        fetchMenus(currentPage, limit);
    });
</script>

<!-- Popup form -->
{#if isShowForm}
<CreateEditForm
    {isEditing}
    {newMenu}
    {formErrors}
    {days}
    {isEveryday}
    resetForm={resetForm}
    handleSave={handleSave}
    toggleEveryday={toggleEveryday}
    updateEverydayStatus={updateEverydayStatus}
/>
{/if}

<FooditemsMgmt
  bind:isShowPopup={isShowFoodPopup}
  bind:menuFoodItems={newMenu.foodItems}
  foodItems={lstFooditems}
  onSubmit={updateMenu}
  onCancel={closeFoodItems}
/>

<!-- Menu List -->
<div class="container mx-auto p-6 flex flex-col space-y-6 bg-gray-50 relative transition-all duration-300"
    style="height:{isCollapsed?'calc(100% - 30px)':'calc(100% - 220px)'} ;"
>
    <!-- Button Section -->
    <div class="flex items-center justify-between">
        <!-- Create Menu Button -->
        <button class="mb-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg 
                    shadow-lg hover:bg-blue-700 transition-all duration-300"
            on:click={openForm}>
            Create Menu
        </button>

        <!-- Pagination buttons -->
        <div class="flex items-center justify-center space-x-2">
            <!-- First Page Button -->
            <button
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              on:click={() => goToPage(1)}>
              <i class="fas fa-angle-double-left"></i>
            </button>
          
            <!-- Previous Page Button -->
            <button
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              on:click={() => goToPage(currentPage - 1)}>
              <i class="fas fa-angle-left"></i>
            </button>
          
            <!-- Ellipses on the Left -->
            {#if startPage > 1}
              <span class="px-3 py-2">...</span>
            {/if}
          
            <!-- Page Numbers -->
            {#each pagesToShow as page}
              <button
                class="px-3 py-2 rounded-lg transition"
                class:bg-blue-500={page === currentPage}
                class:text-white={page === currentPage}
                class:bg-gray-200={page !== currentPage}
                class:hover:bg-gray-300={page !== currentPage}
                on:click={() => goToPage(page)}>
                {page}
              </button>
            {/each}
          
            <!-- Ellipses on the Right -->
            {#if endPage < totalPages}
              <span class="px-3 py-2">...</span>
            {/if}
          
            <!-- Next Page Button -->
            <button
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              on:click={() => goToPage(currentPage + 1)}>
              <i class="fas fa-angle-right"></i>
            </button>
          
            <!-- Last Page Button -->
            <button
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              on:click={() => goToPage(totalPages)}>
              <i class="fas fa-angle-double-right"></i>
            </button>

            <!-- Dropdown for Limit -->
            <div class="flex items-center">
                <label for="limit" class="mr-2 text-sm font-medium">page size</label>
                <select
                id="limit"
                class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition "
                bind:value={limit}
                on:change={(e) => updateLimit(e.target.value)}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>

        <!-- View Toggle Buttons -->
        <div class="flex space-x-0">
            <button
                class="px-4 py-2 text-sm font-semibold rounded-l-lg transition-all duration-300 
                     hover:bg-blue-300 
                    {isGridView?'is-active bg-blue-500 text-white':'bg-gray-200'}"
                on:click={() => (isGridView = true)}
                
            >
                <i class="fas fa-th"></i> <!-- Font Awesome grid icon -->
            </button>
            <button
                class="px-4 py-2 text-sm font-semibold rounded-r-lg transition-all duration-300 
                    hover:bg-blue-300
                    {!isGridView?'is-active bg-blue-500 text-white':'bg-gray-200'}"
                on:click={() => (isGridView = false)}
                
            >
                <i class="fas fa-list"></i> <!-- Font Awesome list icon -->
            </button>
        </div>
        
    </div>

    <!-- Pills Section -->
    <div class="flex justify-between items-center space-x-2 bg-gray-100 p-4 rounded-lg">
        <div class="flex items-center w-full space-x-2 overflow-x-auto">
            {#each days as day, index}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="flex-grow text-center py-2 px-4 rounded-full font-semibold cursor-pointer 
                    {selectedDay  === day 
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
 
    <!-- Menus Section -->
    <div class="overflow-auto pr-4 {isGridView ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}">
        {#if $menus.length == 0}
            <strong>Menu is empty</strong>
        {/if}

        {#each $menus as m}
        <div class="{isGridView ? 'bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex flex-col' : 'flex items-center bg-white rounded-lg shadow-md p-4 space-x-4'}">
            <!-- Image Section -->
            <!-- <div class={isGridView ? 'mb-4' : 'w-1/10'}>
                <div class="relative w-full bg-gray-100 rounded overflow-hidden {isGridView? 'h-40':'h-28'}">
                    {#if category.image}
                        <img class="object-cover w-full h-full"
                        src={category.image} 
                        alt="{category.name} Category Image" />
                    {:else}
                        <div class="flex items-center justify-center h-full text-gray-400 italic">
                            No Image
                        </div>
                    {/if}
                </div>
            </div> -->

            <!-- Details Section -->
            <div class={isGridView ? 'mb-4 space-y-2' : 'flex-1'}>
                <h3 class={isGridView ? 'text-lg font-bold text-gray-800 mb-2' : 'text-base font-semibold'}>
                    {m.name}
                </h3>
                <p class="text-sm">
                    <span class="text-gray-600">Availability Status:</span>
                    <strong class={m.isAvailable ? 'text-green-600' : 'text-red-600'}>
                        {m.isAvailable ? 'Yes' : 'No'}
                    </strong>
                </p>
                <div class="text-sm">
                    <span class="flex text-gray-800">Repeat Days:</span>
                    <div class="flex flex-wrap gap-1">
                        {#each m.repeatDay as rd}
                          <span class="text-white font-bold bg-black bg-opacity-60 px-2 py-1 rounded-md inline-block">
                            {rd}
                          </span>
                        {/each}
                    </div>
                </div>
                
            </div>

            <!-- Action Buttons -->
            <div class={isGridView ? 'mt-auto mb-2 flex space-x-2' : 'flex space-x-2'}>
                <button class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg
                                hover:bg-blue-600 transition-all duration-200"
                    on:click={() => editFoodItems(m)}>
                    FoodItems ({m.foodItems.length})
                </button>
                <!-- <button class="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg
                                    hover:bg-yellow-600 transition-all duration-200"
                    on:click={() => deleteMenu(m._id)}>
                    Show Items
                </button> -->
            </div>

            <div class={isGridView ? 'flex space-x-2' : 'flex space-x-2'}>
                <button class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg
                                hover:bg-green-600 transition-all duration-200"
                    on:click={() => editMenu(m)}>
                    Edit 
                </button>
                <button class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg
                                    hover:bg-red-600 transition-all duration-200"
                    on:click={() => deleteMenu(m._id)}>
                    Delete
                </button>
            </div>
        </div>
        {/each}
    </div>

</div>

<!-- Collapsible Bottom Section -->
<!-- Bottom Section with Toggleable Tab -->
<div class="absolute bottom-0 w-full bg-gray-100 border-t border-gray-300 overflow-x-auto transition-all duration-300"
    style="width: calc(100% - 16rem - 4px); left:calc(16rem + 2px); height: 250px;
        bottom:{isCollapsed?'-204px': '0'}">
    
    <!-- Toggle Tab (Collapsible Header) -->
    <div class="flex items-center space-x-4 bg-gray-800 text-white py-2 px-4 cursor-pointer"
        on:click="{toggleCollapse}"
        on:keydown="{handleKeydown}"
        role="button"             
        tabindex="0"               
        aria-expanded="{!isCollapsed}"   
        aria-controls="food-items-content"> <!-- Links to the content that this button controls -->
        {#if selectedDay == days[todayIndex]}
            <h3 class="text-lg font-semibold">Today's Items</h3>
            <i class="text-sm">({formattedDate})</i>
        {:else}
            <h3 class="text-lg font-semibold">{selectedDay}'s Items</h3>
        {/if}
        <span class="text-xl">{isCollapsed ? '▲' : '▼'}</span> <!-- Toggle Icon -->
        
    </div>

    <!-- Collapsible Content Section -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div id="food-items-content" class="p-2 flex items-center overflow-x-auto " 
        style="height:calc(100% - 50px)"
        on:mousedown="{startPan}"
        on:mouseup="{stopPan}"
        on:mouseleave="{stopPan}"
        on:mousemove="{handlePan}"
        >
        <div class="max-w-screen-xl px-6 h-full flex space-x-4">
            {#if daysFooditems.length==0 }
                <strong>No food items available</strong>
            {:else}
                {#each daysFooditems as foodItem}
                <div class="min-w-[150px] max-w-[150px] h-full bg-white rounded-lg shadow-md p-4 flex flex-col space-y-2">
                    <!-- Title Section -->
                    <h4 class="text-base font-semibold text-gray-800 flex-shrink-0">{foodItem.name}</h4>

                    <!-- Image Section -->
                    <div class="relative bg-gray-100 rounded overflow-hidden flex-grow" style="height: auto;">
                        {#if foodItem.image}
                            <img class="object-cover w-full h-full"
                            src={foodItem.image} 
                            alt="{foodItem.name} Image" 
                            draggable="false"/>
                        {:else}
                            <div class="flex items-center justify-center h-full text-gray-400 italic">
                                No Image
                            </div>
                        {/if}
                    </div>
                </div>
                {/each}
            {/if}
        </div>
    </div>

</div>
