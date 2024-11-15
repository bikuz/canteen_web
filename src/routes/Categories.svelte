<script>
    import { categories, fetchCategories, createCategory, updateCategory, deleteCategory } from '../stores/categories';
    import { onMount } from 'svelte';

    let newCategory = { name: '', image: '' };
    let editing = null;

    onMount(fetchCategories);

    // Handle form submission for creating or updating
    function handleSave() {
        if (editing) {
            updateCategory(editing._id, newCategory); // Updating an existing category
            editing = null;
        } else {
            createCategory(newCategory); // Creating a new category
        }
        newCategory = { name: '', image: '' };
    }

    // Set category in form for editing
    function editCategory(category) {
        editing = category;
        newCategory = { ...category };
    }

    // Clear the form and reset editing mode
    function clearForm() {
        editing = null;
        newCategory = { name: '', image: '' };
    }

    // Handle image file upload and convert to base64
    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                newCategory.image = reader.result; // Convert file to base64
            };
            reader.readAsDataURL(file); // Read the file as data URL
        }
    }
</script>

<style>
    .category-form, .category-list {
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 20px;
        margin: 20px auto;
        width: 80%;
        max-width: 600px;
    }

    h2 {
        font-size: 1.8rem;
        margin-bottom: 15px;
        color: #333;
        text-align: center;
    }

    /* Input Fields */
    .input-field, .input-file {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border-radius: 6px;
        border: 1px solid #ddd;
        font-size: 1rem;
    }

    .input-file {
        padding: 8px;
        cursor: pointer;
    }

    /* Buttons */
    .btn {
        padding: 10px 20px;
        font-size: 1rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin: 5px;
    }

    .btn.primary {
        background-color: #4CAF50;
        color: white;
    }

    .btn.primary:hover {
        background-color: #45a049;
    }

    .btn.cancel {
        background-color: #f44336;
        color: white;
    }

    .btn.cancel:hover {
        background-color: #d32f2f;
    }

    .btn.edit {
        background-color: #ff9800;
        color: white;
    }

    .btn.edit:hover {
        background-color: #fb8c00;
    }

    .btn.delete {
        background-color: #f44336;
        color: white;
    }

    .btn.delete:hover {
        background-color: #d32f2f;
    }

    /* Category list */
    .category-list {
        margin-top: 30px;
    }

    .category-item {
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .category-details {
        font-size: 1.1rem;
        color: #333;
    }

    .category-actions button {
        margin-left: 10px;
    }

    /* Image Preview Styling */
    .image-preview {
        margin-top: 15px;
    }

    .preview-img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    /* Image display in category list */
    .category-img {
        max-width: 100px;
        height: auto;
        border-radius: 8px;
        border: 1px solid #ddd;
    }

    .category-image span {
        font-size: 1rem;
        color: #777;
    }
</style>

<div class="category-form">
    <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
    <input type="text" placeholder="Category Name" bind:value={newCategory.name} class="input-field" />

    <!-- File input for image upload -->
    <input type="file" accept="image/*" on:change={handleImageUpload} class="input-file" />

    <!-- Image preview -->
    {#if newCategory.image}
    <div class="image-preview">
        <img src={newCategory.image} alt="{newCategory.name} Category Image Preview" class="preview-img" />
    </div>
    {/if}

    <div class="buttons">
        <button on:click={handleSave} class="btn primary">
            {editing ? 'Update Category' : 'Add Category'}
        </button>
        {#if editing}
            <button on:click={clearForm} class="btn cancel">Cancel</button>
        {/if}
    </div>
</div>

<div class="category-list">
    <h2>Categories</h2>
    {#each $categories as category}
        <div class="category-item">
            <div class="category-details">
                <strong>{category.name}</strong>
            </div>
            <!-- Displaying category image -->
            <div class="category-image">
                {#if category.image}
                    <img src={category.image} alt="{category.name} Category Image" class="category-img" />
                {:else}
                    <span>No Image</span>
                {/if}
            </div>
            <div class="category-actions">
                <button on:click={() => editCategory(category)} class="btn edit">Edit</button>
                <button on:click={() => deleteCategory(category._id)} class="btn delete">Delete</button>
            </div>
        </div>
    {/each}
</div>
