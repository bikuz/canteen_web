<script>
    import { categories, fetchCategories, createCategory, updateCategory, deleteCategory } from '../stores/categories';
    import { onMount } from 'svelte';

    let newCategory = { name: '', description: '', image: '' };
    let editing = null; // holds the category being edited

    onMount(fetchCategories);

    // Handle form submission for creating or updating
    function handleSave() {
        if (editing) {
            updateCategory(editing._id, newCategory); // Updating an existing category
            editing = null;
        } else {
            createCategory(newCategory); // Creating a new category
        }
        newCategory = { name: '', description: '', image: '' };
    }

    // Set category in form for editing
    function editCategory(category) {
        editing = category;
        newCategory = { ...category };
    }

    // Clear the form and reset editing mode
    function clearForm() {
        editing = null;
        newCategory = { name: '', description: '', image: '' };
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

<div class="category-form">
    <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
    <input type="text" placeholder="Name" bind:value={newCategory.name} />
    <input type="text" placeholder="Description" bind:value={newCategory.description} />
    
    <!-- File input for image upload -->
    <input type="file" accept="image/*" on:change={handleImageUpload} />

    <button on:click={handleSave}>
        {editing ? 'Update Category' : 'Add Category'}
    </button>
    {#if editing}
        <button on:click={clearForm}>Cancel</button>
    {/if}
</div>

<div class="category-list">
    <h2>Categories</h2>
    {#each $categories as category}
        <div class="category-item">
            <div>
                <strong>{category.name}</strong> - {category.description}
            </div>
            <div>
                <button on:click={() => editCategory(category)}>Edit</button>
                <button on:click={() => deleteCategory(category._id)}>Delete</button>
            </div>
        </div>
    {/each}
</div>
