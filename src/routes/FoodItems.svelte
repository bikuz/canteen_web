<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import * as api from '../services/apiHandler';
    import {imageUpload} from '../services/imgHandler'
    import {secondsToTime12,secondsToTime24, timeToSeconds} from '../services/dateTimeHandler'
    import { Rss } from 'svelte-hero-icons';

   
    export const foodItems = writable([]);
    // let lstCategory = [];
    let lstCategory = writable([]);
    let selectedCategory = 'all';
    let isGridView = writable(true); // Default to grid view
    let currentPage = 1; // Current active page
    let total=0;
    let totalPages = 0; // Total number of pages
    let limit = '10';
    const visiblePages = 5; // Number of pages to display
    
    let newFoodItem = {
        name: '',
        description:'',
        category:'',
        price:0,
        image: null,
        isAvailable: true,
        orderingStartTime: 0,
        orderingEndTime: 0,
        isOrderTimeFrameActive: false,
    };
    let formErrors = {
        name: null,
        category:null,
        price:null,
        timeRange: null,
    };
    let isShowForm = false;
    let isLoading = false;
    let previewImage =null;
    let isEditing = false;
    let editingId = null; // ID of the category being edited

    function openForm() {isShowForm=true;}
    function closeForm (){isShowForm = false;}
    function resetError(){formErrors = { name: null, timeRange: null };}
    function resetForm() {
        isEditing = false;
        editingId = null;
        previewImage =null;
        newFoodItem = {
            name: '',
            description:'',
            category:'',
            price:0,
            image: null,
            isAvailable: true,
            orderingStartTime: 0,
            orderingEndTime: 0,
            isOrderTimeFrameActive: false,
        };
        closeForm();
        resetError();
    }
    function validateForm() {
        let isValid = true;

        // Reset errors
        resetError();

        // Validate category name
        if (!newFoodItem.name.trim()) {
            formErrors.name = 'Name field cannot be empty';
            isValid = false;
        }

        // Validate time range
        if (newFoodItem.orderingStartTime > newFoodItem.orderingEndTime) {
            formErrors.timeRange = 'Start time must be before end time';
            isValid = false;
        }

        return isValid;
    }
    
    // Two Way Binding
    
    $: startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    $: endPage = Math.min(totalPages, startPage + visiblePages - 1);
    $: pagesToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
        currentPage = page;
        fetchFoodItems(page, limit);
        }
    };
    const updateLimit = (newLimit) => {
        limit=newLimit;
        currentPage = 1; // Reset to first page when limit changes
        fetchFoodItems(currentPage, limit);
    };

    async function fetchCategories() {
        await api.getItems({
            endPoint: 'categories',
            onSuccess: (data) => {
               lstCategory.set(data);
            },
            onError: (error) => console.error('Error fetching categories:', error),
        });
    }

    async function fetchFoodItems(page, limit) {
        await api.getItems({
            endPoint: `fooditems/page/${page}/limit/${limit}${selectedCategory !== 'all' ? `/category/${selectedCategory}` : ''}`,
            onSuccess: (data) => {
                foodItems.set(data.fooditems.map(fd => ({
                    ...fd,
                    _starttime: secondsToTime12(fd.orderingStartTime),
                    _endtime: secondsToTime12(fd.orderingEndTime),
                })));
                total = data.total;
                totalPages = Math.ceil(total / limit);
            },
            onError: (error) => console.error('Error fetching food items:', error),
        });
    }


    function filterByCategory(category) {
        selectedCategory = category;
        currentPage = 1; // Reset to first page when changing category
        fetchFoodItems(currentPage, limit);
    }

    // Create a new fooditem
    async function createFoodItem() {
        try {
            await api.createItem(newFoodItem, {
                endPoint: 'fooditems',
                contentType:'multipart/form-data',
                onSuccess: (data) => {
                    data._starttime= secondsToTime12(data.orderingStartTime),
                    data._endtime= secondsToTime12(data.orderingEndTime),
                    foodItems.update((current) => [...current, data]); 
                    resetForm();
                },
                onError: (error) => alert(`Error: ${error.message}`),
            });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }

     // Update an existing fooditem
     async function updateFoodItem() {
        try {
            await api.updateItem({ id: editingId, ...newFoodItem }, {
                endPoint: 'fooditems',
                contentType:'multipart/form-data',
                onSuccess: (data) => {
                    data._starttime= secondsToTime12(data.orderingStartTime),
                    data._endtime= secondsToTime12(data.orderingEndTime),
                    foodItems.update((current) =>
                        current.map((fd) =>
                            fd._id === editingId ? data : fd
                        )
                    );
                    // alert('Category updated successfully!');
                    resetForm();
                },
                onError: (error) => alert(`Error: ${error.message}`),
                // onFinally : () => console.log('Update category completed.'),
            });
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }

    function editFoodItem(fd) {
        isEditing = true;
        editingId = fd._id;
        previewImage = fd.image;
        newFoodItem = {
            name: fd.name,
            price:fd.price,
            description:fd.description,
            category:fd.category,
            image: null, // Set this to null to allow optional image updates
            isAvailable: fd.isAvailable,
            orderingStartTime: fd.orderingStartTime,
            orderingEndTime: fd.orderingEndTime,
            isOrderTimeFrameActive: fd.isOrderTimeFrameActive,
            _startTime:secondsToTime24(fd.orderingStartTime),
            _endTime:secondsToTime24(fd.orderingEndTime)
        };
        openForm();
    }

    $: newFoodItem.orderingStartTime = timeToSeconds(newFoodItem._startTime);
    $: newFoodItem.orderingEndTime = timeToSeconds(newFoodItem._endTime);

    // Delete a category and remove it from the list
    async function deleteFoodItem(id) {
        // Ask for confirmation before deleting
        const isConfirmed = window.confirm('Are you sure you want to delete this fooditem?');
        
        if (!isConfirmed) {
            return; // Exit the function if the user cancels
        }

        try {
            await api.deleteItem(id, {
                endPoint: 'fooditems',
                onSuccess: () => {
                    foodItems.update((current) => current.filter((fd) => fd._id !== id));
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
            await updateFoodItem();
        } else {
            await createFoodItem(); 
        }
    }

    async function handleImageUpload(event) {
        await imageUpload(event,{
        onSuccess:function(file){
            previewImage = file.imageURL;
            newFoodItem.image = file.imageFile;
        },
        onError:function(msg){
            alert(msg);
        }
        });
        
    }

    onMount(() => {
        fetchCategories();
        fetchFoodItems(currentPage, limit);
    });
</script>

<!-- Popup form -->
{#if isShowForm}
<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div class="category-form bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto relative flex">
      <!-- Form Section -->
        <div class="flex-1">
            <!-- Close Button at the Top Right -->
            <button 
                on:click={resetForm} 
                class="absolute top-2 right-2 text-gray-700 text-xl hover:text-black transition focus:outline-none border-none"
                aria-label="Close">
                &times;
            </button>

            <h2 class="text-2xl font-semibold mb-6 text-center text-gray-800">
                {isEditing ? 'Edit FoodItem' : 'Add FoodItem'}
            </h2>

            <!-- Input for category name -->
            <input 
                type="text" 
                placeholder="FoodItem Name" 
                bind:value={newFoodItem.name} 
                class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            {#if formErrors.name}
                <p class="text-red-500 text-sm mb-4">{formErrors.name}</p>
            {/if}

            <input 
            type="text" 
            placeholder="Description" 
            bind:value={newFoodItem.description} 
            class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <label for="isAvailable" class="text-sm text-gray-700">Price</label>
            <input 
            type="text" 
            placeholder="Price" 
            bind:value={newFoodItem.price} 
            class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            <div class="mb-4">
                <select
                  bind:value={newFoodItem.category}
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select Category</option>
                  {#each $lstCategory as categoryOption}
                    <option value={categoryOption._id}>{categoryOption.name}</option>
                  {/each}
                </select>
            </div>

            <div class="flex items-center space-x-4 mb-4">
                <label for="isAvailable" class="text-sm text-gray-700">Availability Status</label>
            
                <label class="flex items-center space-x-2">
                <input
                    type="radio"
                    bind:group={newFoodItem.isAvailable}
                    value={true}
                    class="w-6 h-6 accent-blue-500 border border-gray-300 rounded-full"/>
                <span class="text-sm">Yes</span>
                </label>
            
                <label class="flex items-center space-x-2">
                <input
                    type="radio"
                    bind:group={newFoodItem.isAvailable}
                    value={false}
                    class="w-6 h-6 accent-gray-500 border border-gray-300 rounded-full"/>
                <span class="text-sm">No</span>
                </label>
            </div>
        

            <div class="items-center space-x-2 mb-4 border border-gray-300 rounded-lg p-2">
                <label for="" class="text-sm mr-2 text-gray-700 flex items-center">
                <input 
                    type="checkbox" 
                    id="isOrderTimeFrameActive" 
                    bind:checked={newFoodItem.isOrderTimeFrameActive} 
                    class="w-4 h-4 accent-blue-500 mr-2">
                Order Time Status
                </label>
                {#if newFoodItem.isOrderTimeFrameActive}
                    <div class="flex items-center space-x-4 mt-4 mb-2">
                        <div class="flex-1">
                            <label for="startTime" class="text-sm text-gray-700">Start Time:</label>
                            <input 
                                type="time" 
                                id="startTime" 
                                bind:value={newFoodItem._startTime} 
                                class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div class="flex-1">
                            <label for="endTime" class="text-sm text-gray-700">End Time:</label>
                            <input 
                                type="time" 
                                id="endTime" 
                                bind:value={newFoodItem._endTime} 
                                class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    
                    </div>
                    {#if formErrors.timeRange}
                        <div>
                            <p class="text-red-500 text-sm mb-4">{formErrors.timeRange}</p>
                        </div>
                    {/if}
                {/if}
            </div>
        
        
            <!-- File input for image upload -->
            <input 
                type="file" 
                accept="image/*" 
                on:change={handleImageUpload} 
                class="w-full p-2 border border-gray-300 rounded-lg mb-4 file:mr-4 file:py-2 file:px-4 
                    file:rounded file:border-0 file:text-white file:bg-blue-500 file:hover:bg-blue-600"/>

            <!-- Buttons: Add FoodItem and Cancel -->
            <div class="flex items-center justify-between space-x-4 mt-6">
                <button 
                    on:click={handleSave} 
                    class="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full sm:w-auto">
                    {isEditing ? 'Update FoodItem' : 'Add FoodItem'}
                </button>

                <button 
                    on:click={resetForm} 
                    class="py-2 px-4 border border-red-300 text-red-400  rounded hover:bg-gray-100"
                >
                Cancel
                </button>
            </div>
        </div>
  
        <!-- Image Preview Section -->
        {#if previewImage}
        <div class="flex-1 w-1/3 pl-6">
            <div class="category-image mb-4">
            <img 
                src={previewImage} 
                alt="{newFoodItem.name} Category Image Preview" 
                class="w-full h-96 object-cover rounded-lg border border-gray-300"/>
            </div>
        </div>
        {/if}
    </div>
</div>
{/if}

<!-- FoodItem List -->
<div class="container mx-auto p-6 flex flex-col space-y-6 bg-gray-50 h-full">
    <!-- Button Section -->
    <div class="flex items-center justify-between">
        <!-- Create Category Button -->
        <button class="mb-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg 
                    shadow-lg hover:bg-blue-700 transition-all duration-300"
            on:click={openForm}>
            Create FoodItem
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

    <!-- Category Filter Buttons -->
    {#if $lstCategory.length > 0}
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
            {#each $lstCategory as category}
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

    <!-- fooditems Section -->
    <div class="overflow-auto pr-4 {isGridView ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}">
        
        {#if $foodItems.length==0}
            <strong>FoodItem is empty</strong>
        {/if}

        {#each $foodItems as fi}
        <div class="{isGridView ? 'bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex flex-col' : 'flex items-center bg-white rounded-lg shadow-md p-4 space-x-4'}">
            <!-- Image Section -->
            <div class={isGridView ? 'mb-4' : 'w-1/10'}>
                <div class="relative w-full bg-gray-100 rounded overflow-hidden {isGridView? 'h-40':'h-28'}">
                    {#if fi.image}
                        <img class="object-cover w-full h-full"
                        src={fi.image} 
                        alt="{fi.name} Category Image" />
                    {:else}
                        <div class="flex items-center justify-center h-full text-gray-400 italic">
                            No Image
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Details Section -->
            <div class={isGridView ? 'mb-4 space-y-2' : 'flex-1'}>
                {#if isGridView}
                    <h3 class={isGridView ? 'text-lg font-bold text-gray-800 mb-2' : 'text-base font-semibold'}>
                        {fi.name} 
                    </h3>
                    <i class="text-sm text-gray-600">{fi.description}</i>
                {:else}
                    <div >
                        <span class={isGridView ? 'text-lg font-bold text-gray-800 mb-2' : 'text-base font-semibold'}>{fi.name} </span>
                        <i class="text-sm text-gray-600"> -{fi.description}</i>
                    </div>
                {/if}
                <p class="text-sm">
                    <span class="font-bold text-blue-600">Rs. {fi.price}</span>
                </p>
                <p class="text-sm">
                    <span class=" text-gray-600">Category: </span>
                    <strong>{$lstCategory.find(cat => cat._id === fi.category)?.name || 'Unknown'}</strong>
                </p>
                <p class="text-sm">
                    <span class="text-gray-600">Availability Status:</span>
                    <strong class={fi.isAvailable ? 'text-green-600' : 'text-red-600'}>
                        {fi.isAvailable ? 'Yes' : 'No'}
                    </strong>
                </p>
                <p class="text-sm">
                    <span class="text-gray-800">Order Time:</span>
                    <strong>{fi._starttime} - {fi._endtime}</strong>
                </p>
                <p class="text-sm">
                    <span class="text-gray-800">Order Time Status:</span>
                    <strong class={fi.isOrderTimeFrameActive ? 'text-green-600' : 'text-red-600'}>
                        {fi.isOrderTimeFrameActive ? 'Active' : 'Not Active'}
                    </strong>
                </p>
            </div>

            <!-- Action Buttons -->
            <div class={isGridView ? 'mt-auto flex space-x-2' : 'flex space-x-2'}>
                <button class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg
                                hover:bg-green-600 transition-all duration-200"
                    on:click={() => editFoodItem(fi)}>
                    Edit
                </button>
                <button class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg
                                    hover:bg-red-600  transition-all duration-200"
                    on:click={() => deleteFoodItem(fi._id)}>
                    Delete
                </button>
            </div>
        </div>
        {/each}
    </div>
</div>