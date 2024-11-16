<script>
    import { categories, fetchCategories, createCategory, updateCategory, deleteCategory } from '../stores/categories';
    import { onMount } from 'svelte';

    let showCategoryForm = false;
    let newCategory = { name: '', image: '' };
    let editing = null;
    let isNameEmpty = false;

    function toggleCategoryForm() {
    showCategoryForm = !showCategoryForm;
  }

    onMount(fetchCategories);

   
    
    function handleSave() {
    
      isNameEmpty = !newCategory.name.trim();
      if (isNameEmpty)
        return;

      if (editing && editing._id) {
          // Ensure `editing._id` exists and is valid
          if (editing._id) {
              updateCategory(editing._id, newCategory); 
              editing = null;
          } else {
              console.error("Category ID is missing for update");
          }
      } else {
          createCategory(newCategory); // Create a new category
      }

    newCategory = { name: '', image: '' };
    showCategoryForm = false;
}


    // Set category in form for editing
    // function editCategory(category) {
    //     editing = category;
    //     newCategory = { ...category };
    // }

    function editCategory(category) {
    newCategory = { ...category };
    editing = { ...category };
    showCategoryForm = true; // Show the modal when editing
  }


    // Clear the form and reset editing mode
    function clearForm() {
        // editing = null;
        // newCategory = { name: '', image: '' };
        newCategory = {};  // Reset the newCategory object
        showCategoryForm = false;
    }

    // Handle image file upload and convert to base64
    async function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Check if file size is greater than 2MB (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 1 * 1024 * 1024; 

        if (file.size > maxSize) {
            alert('File is too large. Please select a file smaller than 1MB.');
            return; 
        }

        newCategory.image =file;
        // const reader = new FileReader();
        // reader.onload = () => {
        //     newCategory.image = reader.result; 
        // };
        // reader.readAsDataURL(file);
    }
}

</script>
<!-- <button
  on:click={toggleCategoryForm}
  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
>
  Add Category
</button> -->

<!-- Modal -->
<button
  on:click={toggleCategoryForm}
  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
>
  {editing ? 'Edit Category' : 'Add Category'}
</button>

<!-- Category Form Popup -->
{#if showCategoryForm}
  <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div class="category-form bg-white p-6 rounded shadow-md max-w-lg mx-auto">
      <h2 class="text-2xl font-semibold mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>

      <!-- Input for category name -->
      <input 
        type="text" 
        placeholder="Category Name" 
        bind:value={newCategory.name} 
        class="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
      />

      {#if isNameEmpty}
      <p class="text-red-500 text-sm mb-4">This field cannot be empty.</p>
        {/if}

      <!-- File input for image upload -->
      <input 
        type="file" 
        accept="image/*" 
        on:change={handleImageUpload} 
        class="w-full p-2 border border-gray-300 rounded mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-white file:bg-blue-500 file:hover:bg-blue-600" 
      />

      <!-- Image preview -->
      {#if newCategory.image}
        <div class="image-preview mb-4">
          <img 
            src={newCategory.image} 
            alt="{newCategory.name} Category Image Preview" 
            class="w-full h-auto rounded border border-gray-300"
          />
        </div>
      {/if}

      <div class="flex space-x-4">
        <button 
          on:click={handleSave} 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
          {editing ? 'Update Category' : 'Add Category'}
        </button>
        {#if editing}
          <button 
            on:click={clearForm} 
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        {/if}
        <button
          on:click={toggleCategoryForm}
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Category List -->
<div class="category-list mt-8 max-w-4xl mx-auto p-10 h-96 overflow-y-auto">
  <h2 class="text-2xl font-semibold mb-4">Categories</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {#each $categories as category}
      <div class="category-item bg-white p-4 rounded shadow flex flex-col">
        <div class="category-details mb-2">
          <strong class="text-lg">{category.name}</strong>
        </div>

        <!-- Displaying category image -->
        <div class="category-image mb-2">
          {#if category.image}
            <img 
              src={category.image} 
              alt="{category.name} Category Image" 
              class="w-full h-32 object-cover rounded border border-gray-300"
            />
          {:else}
            <span class="text-gray-500 italic">No Image</span>
          {/if}
        </div>

        <div class="category-actions flex space-x-2 mt-auto">
          <button 
            on:click={() => editCategory(category)} 
            class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Edit
          </button>
          <button 
            on:click={() => deleteCategory(category._id)} 
            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>