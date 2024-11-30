<script>
    import { fly } from "svelte/transition";
    export let isShowPopup = false; // Control visibility
    export let foodItems = []; // List of all food items
    export let menuFoodItems = []; // Selected food items (bound to parent)
    export let onSubmit; // Callback for submission
    export let onCancel; // Callback for canceling

    function selectFoodItem(item) {
      if (!menuFoodItems.includes(item)) {
        menuFoodItems = [...menuFoodItems, item]; // Add to selected items
      }
    }
  
    function removeFoodItem(item) {
      menuFoodItems = menuFoodItems.filter((i) => i !== item); // Remove from selected items
    }
  </script>
  
  {#if isShowPopup}
<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
  <div
    class="bg-white shadow-xl rounded-lg flex flex-col overflow-hidden"
    style="width: 80%; height: 80%;"
  >
    <!-- Content Section -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left Container: Available Food Items -->
      <div class="flex-1 p-4 overflow-y-auto border-r border-gray-300">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Available Food Items</h2>
        <div class="grid grid-cols-3 gap-4">
          {#each foodItems as item}
            {#if !menuFoodItems.some((selectedItem) => selectedItem._id === item._id)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="bg-gray-100 rounded-lg shadow-md p-2 cursor-pointer hover:shadow-lg transition"
                on:click={() => selectFoodItem(item)}
                transition:fly={{ x: -300, duration: 300 }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  class="w-full h-24 object-cover rounded-t-lg"
                />
                <h3 class="text-center text-sm font-semibold mt-2">{item.name}</h3>
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Right Container: Selected Food Items -->
      <div class="flex-1 p-4 overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Selected Food Items</h2>
        <div class="grid grid-cols-3 gap-4">
          {#each menuFoodItems as item}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="bg-blue-100 rounded-lg shadow-md p-2 cursor-pointer hover:shadow-lg transition"
              on:click={() => removeFoodItem(item)}
              transition:fly={{ x: 300, duration: 300 }}
            >
              <img
                src={item.image}
                alt={item.name}
                class="w-full h-24 object-cover rounded-t-lg"
              />
              <h3 class="text-center text-sm font-semibold mt-2">{item.name}</h3>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Footer Section -->
    <div class="flex justify-start p-4 border-t border-gray-300">
      <button
        on:click={onSubmit}
        class="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition mr-2"
      >
        Submit
      </button>
      <button
        on:click={onCancel}
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-md hover:bg-gray-200 transition"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
{/if}
  