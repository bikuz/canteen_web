<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import * as api from '../services/apiHandler';
  import {imageUpload} from '../services/imgHandler'
  import {secondsToTime} from '../services/dateTimeHandler'

   // API Base URL
  const API_BASE_URL = 'http://localhost:3000/categories'; 

  export const categories = writable([]);

  let showCategoryForm = false;
  let newCategory = {
      name: '',
      image: null,
      isAvailable: true,
      orderingStartTime: 0,
      orderingEndTime: 0,
      isActive: false,
  };
  let editing = null;
  let previewImage = null;
  let isLoading = false;
  let isNameEmpty = false;

// Function to convert seconds to HH:mm format
async function fetchCategories() {
  await api.getItems({
      endPoint: 'categories',
      success: (data) => {
        const processedCategories = data.map(category => ({
            ...category,
            _starttime: secondsToTime(category.orderingStartTime),
            _endtime: secondsToTime(category.orderingEndTime),
        }));
        // $categories = processedCategories;
        categories.set(processedCategories);
      },
      err: (error) => console.error('Error fetching categories:', error),
      // lastly: () => console.log('Fetch categories completed'),
  });
}


  // Create Category
  const createCategory = async () => {
  try {
    const formData = new FormData();

    // Append other fields to the formData
    formData.append('name', newCategory.name);
    formData.append('isAvailable', newCategory.isAvailable);
    formData.append('isOrderTimeFrameActive', newCategory.isOrderTimeFrameActive);

    if (newCategory.orderingStartTime) {
      formData.append('orderingStartTime', newCategory.orderingStartTime);
    }

    if (newCategory.orderingEndTime) {
      formData.append('orderingEndTime', newCategory.orderingEndTime);
    }

    // Handle image upload
    if (newCategory.image) {
      formData.append('image', newCategory.image);  
    }

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Category created:', data);
  } catch (error) {
    console.error('Error creating category:', error);
  }
};


  // Update Category
  async function updateCategory(id, category) {
  try {
    isLoading = true;

    const formData = new FormData();

    // Append the updated category fields
    formData.append('name', category.name);
    formData.append('isAvailable', category.isAvailable);
    formData.append('isOrderTimeFrameActive', category.isOrderTimeFrameActive);

    if (category.orderingStartTime) {
      formData.append('orderingStartTime', category.orderingStartTime);
    }

    if (category.orderingEndTime) {
      formData.append('orderingEndTime', category.orderingEndTime);
    }

    // If the category image is updated, append the new image
    if (category.image instanceof File) {
      formData.append('image', category.image);  // `category.image` is the file
    }

    // Make the PATCH request to update the category
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      body: formData, // Send the FormData
    });

    if (response.ok) {
      fetchCategories(); // Refresh categories
    } else {
      console.error('Failed to update category:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating category:', error);
  } finally {
    isLoading = false;
  }
}


  // Delete Category
  async function deleteCategory(id) {
      try {
          isLoading = true;
          const response = await fetch(`${API_BASE_URL}/${id}`, {
              method: 'DELETE',
          });

          if (response.ok) {
              fetchCategories(); // Refresh categories
          } else {
              console.error('Failed to delete category:', response.statusText);
          }
      } catch (error) {
          console.error('Error deleting category:', error);
      } finally {
          isLoading = false;
      }
  }

  // Handle Save (Create or Update)
  async function handleSave() {
    // Check if the name is empty
    isNameEmpty = !newCategory.name.trim();
    if (isNameEmpty) {
        alert('Category name cannot be empty.');
        return;
    }

    // Check if availability is selected
    if (newCategory.isAvailable === undefined) {
        alert('Please select the availability status.');
        return;
    }

    // Set the image to the uploaded file (if any)
    // newCategory.image = previewImage;

    // Handle either create or update operation
    if (editing && editing._id) {
        if (editing._id) {
            await updateCategory(editing._id, newCategory); 
            editing = null;
        } else {
            console.error("Category ID is missing for update");
        }
    } else {
        await createCategory(newCategory); // Create a new category
    }

    // Reset form fields after save
    newCategory = { 
        name: '', 
        image: '', 
        isAvailable: true, 
        orderingStartTime: 0, 
        orderingEndTime: 0,   
        isActive: false       
    };

    // Fetch the updated list of categories after the new category is created
    await fetchCategories(); // Update the UI with the newly created category
    showCategoryForm = false; // Close form after saving
}

  async function handleImageUpload(event) {
    await imageUpload(event,{
      onSuccess:function(file){
        previewImage = file.imageURL;
        newCategory.image = file.imageFile;
      },
      onError:function(msg){
        alert(msg);
      }
    });
      
}


  // Clear Form
  function clearForm() {
      newCategory = {
          name: '',
          image: '',
          isAvailable: true,
          orderingStartTime: 0,
          orderingEndTime: 0,
          isActive: false,
      };
      editing = null;
      previewImage=null;
      showCategoryForm = false;
  }

  // Edit Category
  function editCategory(category) {
      editing = { ...category };
      newCategory = { ...category };
      previewImage=category.image;
      showCategoryForm = true;
  }

  function toggleCategoryForm() {
    showCategoryForm = !showCategoryForm;
  }

  // On Mount
  onMount(fetchCategories);
</script>

<!-- <button
  on:click={toggleCategoryForm}
  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
>
  Add Category
</button> -->

<!-- Modal -->

<!-- Category Form Popup -->
{#if showCategoryForm}
<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
  <div class="category-form bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto relative flex">
    <!-- Form Section -->
    <div class="flex-1">
      <!-- Close Button at the Top Right -->
      <button 
        on:click={toggleCategoryForm} 
        class="absolute top-2 right-2 text-gray-700 text-xl hover:text-black transition focus:outline-none border-none"
        aria-label="Close">
        &times;
      </button>

      <h2 class="text-2xl font-semibold mb-6 text-center text-gray-800">
        {editing ? 'Edit Category' : 'Add Category'}
      </h2>

      <!-- Input for category name -->
      <input 
        type="text" 
        placeholder="Category Name" 
        bind:value={newCategory.name} 
        class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

      {#if isNameEmpty}
        <p class="text-red-500 text-sm mb-4">This field cannot be empty.</p>
      {/if}

      <div class="flex items-center space-x-4 mb-4">
        <label for="isAvailable" class="text-sm text-gray-700">Availability Status</label>
      
        <label class="flex items-center space-x-2">
          <input
            type="radio"
            bind:group={newCategory.isAvailable}
            value={true}
            class="w-6 h-6 accent-blue-500 border border-gray-300 rounded-full"/>
          <span class="text-sm">Yes</span>
        </label>
      
        <label class="flex items-center space-x-2">
          <input
            type="radio"
            bind:group={newCategory.isAvailable}
            value={false}
            class="w-6 h-6 accent-gray-500 border border-gray-300 rounded-full"/>
          <span class="text-sm">No</span>
        </label>
      </div>
      

      <div class="items-center space-x-2 mb-4 border border-gray-300 rounded-lg p-2">
        <label for="isActive" class="text-sm mr-2 text-gray-700 flex items-center">
          <input 
            type="checkbox" 
            id="isActive" 
            bind:checked={newCategory.isActive} 
            class="w-4 h-4 accent-blue-500 mr-2">
          Order Time Frame
        </label>
        {#if newCategory.isActive}
          <div class="flex items-center space-x-4 mt-4 mb-2">
            <div class="flex-1">
              <label for="startTime" class="text-sm text-gray-700">Start Time:</label>
              <input 
                type="time" 
                id="startTime" 
                bind:value={newCategory.orderingStartTime} 
                class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div class="flex-1">
              <label for="endTime" class="text-sm text-gray-700">End Time:</label>
              <input 
                type="time" 
                id="endTime" 
                bind:value={newCategory.orderingEndTime} 
                class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        {/if}
      </div>
      
      
      <!-- File input for image upload -->
      <input 
        type="file" 
        accept="image/*" 
        on:change={handleImageUpload} 
        class="w-full p-2 border border-gray-300 rounded-lg mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-white file:bg-blue-500 file:hover:bg-blue-600"/>

      <!-- Buttons: Add Category and Cancel -->
      <div class="flex items-center justify-between space-x-4 mt-6">
        <button 
          on:click={handleSave} 
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full sm:w-auto">
          {editing ? 'Update Category' : 'Add Category'}
        </button>

        <button 
          on:click={clearForm} 
          class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 w-full sm:w-auto">
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
            alt="{newCategory.name} Category Image Preview" 
            class="w-full h-96 object-cover rounded-lg border border-gray-300"/>
        </div>
      </div>
    {/if}
  </div>
</div>

{/if}

<!-- Category List -->
<div class="container mx-auto p-6 flex flex-col space-y-6 bg-gray-50 h-full">
  <!-- Button to open Form Popup -->
  <button
    class="mb-4 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 self-start"
    on:click={toggleCategoryForm}
  >
    Create Category
  </button>

  <!-- Table Section -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-auto">
    {#each $categories as category}
        <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex flex-col">
            <!-- Category Details -->
            <div class="mb-4">
                <h3 class="text-lg font-bold text-gray-800 mb-2">{category.name}</h3>
                <div class="relative w-full h-40 bg-gray-100 rounded overflow-hidden">
                    {#if category.image}
                        <img 
                            src={category.image} 
                            alt="{category.name} Category Image" 
                            class="object-cover w-full h-full"
                        />
                    {:else}
                        <div class="flex items-center justify-center h-full text-gray-400 italic">
                            No Image
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Timeframe and Status -->
            <div class="mb-4 space-y-2">
                <p class="text-sm">
                    <span class="text-gray-600">Availability Status:</span> 
                    <strong class={category.isAvailable ? 'text-green-600' : 'text-red-600'}>
                        {category.isAvailable ? 'Yes' : 'No'}
                    </strong>
                </p>
                <p class="text-sm">
                    <span class="text-gray-800">Order Timeframe:</span>
                    <strong>{category.orderingStartTime} - {category.orderingEndTime}</strong>
                </p>
            </div>

            <!-- Action Buttons -->
            <div class="mt-auto flex space-x-2">
                <button 
                    on:click={() => console.log('Edit functionality here')} 
                    class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                >
                    Edit
                </button>
                <button 
                    on:click={() => deleteCategory(category._id)} 
                    class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                    Delete
                </button>
            </div>
        </div>
    {/each}
  </div>
</div>
