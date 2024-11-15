<script>
  import axios from 'axios';
  import { onMount } from 'svelte';

  let isPopupOpen = false;
  let name = '';
  let description = '';
  let price = '';
  let quantity = '';
  let image = ''; 
  let type = 'single';
  let category = '';
  let file = null;
  let categories = [];
  let foodItems = [];
  let isEditing = false;
  let editingItemId = null;

  onMount(async () => {
    await fetchCategories();
    await fetchFoodItems();
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/categories');
      categories = response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  function togglePopup() {
    isPopupOpen = !isPopupOpen;
  }

  const createOrUpdateFoodItem = async () => {
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3000/fooditems/${editingItemId}`, {
          name,
          description,
          price,
          quantity,
          image,
          type,
          category
        });
        isEditing = false;
        editingItemId = null;
      } else {
        await axios.post('http://localhost:3000/fooditems', {
          name,
          description,
          price,
          quantity,
          image,
          type,
          category
        });
      }
      clearForm();
      togglePopup();
      fetchFoodItems();
    } catch (error) {
      console.error("Error creating/updating food item:", error);
    }
  };

  const updateFoodItem = async (id) => {
  try {
    const response = await axios.put(`http://localhost:3000/fooditems/${id}`, {
      name,
      description,
      price,
      quantity,
      image,
      type,
      category,
    });
    console.log("Food item updated successfully:", response.data);
  } catch (error) {
    console.error("Error creating/updating food item:", error);
  }
};

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/fooditems');
      foodItems = response.data;
    } catch (error) {
      console.error("Error fetching food items:", error);
    }
  };

  const deleteFoodItem = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/fooditems/${id}`);
      fetchFoodItems();
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  const editFoodItem = (item) => {
    name = item.name;
    description = item.description;
    price = item.price;
    quantity = item.quantity;
    image = item.image;
    type = item.type;
    category = item.category._id;
    editingItemId = item._id;
    isEditing = true;
  };

  const clearForm = () => {
    name = '';
    description = '';
    price = '';
    quantity = '';
    image = '';
    type = 'single';
    category = '';
    file = null;
    isEditing = false;
    editingItemId = null;
  };
</script>
<!-- 
<style>
  
  * { box-sizing: border-box; margin: 0; padding: 0; }

  
  .form-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    margin: 20px auto;
  }
  .form-container h2 { text-align: center; margin-bottom: 20px; color: #4CAF50; }
  .form-container input, .form-container select, .form-container button {
    width: 100%; padding: 12px; margin-bottom: 15px;
    border-radius: 6px; border: 1px solid #ddd; font-size: 1rem;
  }
  .form-container button {
    background-color: #4CAF50; color: white; border: none; cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .form-container button:hover { background-color: #45a049; }
  .form-container button:active { background-color: #388e3c; }

 
  .table-container {
    margin: 40px auto; max-width: 1000px; width: 90%;
    background-color: #fff; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 20px;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
  th { background-color: #f4f4f4; color: #333; }
  tr:hover { background-color: #f9f9f9; }

  
  .action-button {
    padding: 6px 12px;
    margin-right: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: white;
    font-size: 0.9rem;
  }
  .edit-button { background-color: #ff9800; }
  .delete-button { background-color: #f44336; }

</style> -->
<!-- <div class="container mx-auto p-4 h-screen flex flex-col"> -->
  <div class="container mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
  <!-- Button to open Form Popup -->
  <button
    class="mb-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition self-start"
    on:click={togglePopup}
  >
    {isEditing ? 'Edit' : 'Create'} Food Item
  </button>

  <!-- Table Section -->
  <div class="table-container flex-1 overflow-hidden bg-white shadow-md rounded p-3">
    
    <h2 class="text-2xl font-semibold mb-4">Food Items</h2>
    <div class="h-full overflow-auto">
      <table class="min-w-full border border-gray-300">
        <thead>
          <tr class="bg-gray-200 text-left text-gray-600">
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Description</th>
            <th class="px-4 py-2">Price</th>
            <th class="px-4 py-2">Quantity</th>
            <th class="px-4 py-2">Type</th>
            <th class="px-4 py-2">Category</th>
            <th class="px-4 py-2">Image Filename</th>
            <th class="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each foodItems as foodItem}
            <tr class="border-t border-gray-300 hover:bg-gray-100">
              <td class="px-4 py-2">{foodItem.name}</td>
              <td class="px-4 py-2">{foodItem.description}</td>
              <td class="px-4 py-2">{foodItem.price}</td>
              <td class="px-4 py-2">{foodItem.quantity}</td>
              <td class="px-4 py-2">{foodItem.type}</td>
              <td class="px-4 py-2">{foodItem.category.name}</td>
              <td class="px-4 py-2">{foodItem.image}</td>
              <td class="px-4 py-2 flex space-x-2">
                <button
                  class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
                  on:click={() => editFoodItem(foodItem)}
                >
                  Edit
                </button>
                <button
                  class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                  on:click={() => deleteFoodItem(foodItem._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Popup Form Section -->
  {#if isPopupOpen}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white shadow-lg rounded px-8 py-6 w-full max-w-lg">
        <h2 class="text-2xl font-semibold mb-4">{isEditing ? 'Edit' : 'Create'} Food Item</h2>
        
        <div class="mb-4">
          <input
            type="text"
            placeholder="Name"
            bind:value={name}
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <input
            type="text"
            placeholder="Description"
            bind:value={description}
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <input
            type="number"
            placeholder="Price"
            bind:value={price}
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <input
            type="number"
            placeholder="Quantity"
            bind:value={quantity}
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="mb-4">
          <input
            type="file"
            accept="image/*"
            on:change={(e) => file = e.target.files[0]}
            required
            class="w-full text-gray-600"
          />
        </div>

        <div class="mb-4">
          <select
            bind:value={type}
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="combo">Combo</option>
            <option value="buffet">Buffet</option>
          </select>
        </div>

        <div class="mb-4">
          <select
            bind:value={category}
            required
            class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select Category</option>
            {#each categories as categoryOption}
              <option value={categoryOption._id}>{categoryOption.name}</option>
            {/each}
          </select>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            class="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
            on:click={togglePopup}
          >
            Cancel
          </button>
          <button
            on:click={createOrUpdateFoodItem}
            class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            {isEditing ? 'Update' : 'Create'} Food Item
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>