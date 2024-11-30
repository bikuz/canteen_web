
<script>
    export let isEditing = false;
    export let newMenu = {};
    export let formErrors = {};
    export let days = [];
    export let lstFooditems = [];
    export let isEveryday = false;
  
    export let resetForm;
    export let handleSave;
    export let toggleEveryday;
    export let updateEverydayStatus;
</script>

<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto relative flex">
      <!-- Form Section -->
        <div class="flex-1 w-2/5 mr-4">
            <!-- Close Button at the Top Right -->
            <button 
                on:click={resetForm} 
                class="absolute top-2 right-2 text-gray-700 text-xl hover:text-black transition focus:outline-none border-none"
                aria-label="Close">
                &times;
            </button>

            <h2 class="text-2xl font-semibold mb-6 text-center text-gray-800">
                {isEditing ? 'Edit Menu' : 'Add Menu'}
            </h2>

            <!-- Input for menu name -->
            <input 
                type="text" 
                placeholder="Menu Name" 
                bind:value={newMenu.name} 
                class="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            {#if formErrors.name}
                <p class="text-red-500 text-sm mb-4">{formErrors.name}</p>
            {/if}

            <div class="flex items-center space-x-4 mb-4">
                <label for="isAvailable" class="text-sm text-gray-700">Availability Status</label>
            
                <label class="flex items-center space-x-2">
                <input
                    type="radio"
                    bind:group={newMenu.isAvailable}
                    value={true}
                    class="w-6 h-6 accent-blue-500 border border-gray-300 rounded-full"/>
                <span class="text-sm">Yes</span>
                </label>
            
                <label class="flex items-center space-x-2">
                <input
                    type="radio"
                    bind:group={newMenu.isAvailable}
                    value={false}
                    class="w-6 h-6 accent-gray-500 border border-gray-300 rounded-full"/>
                <span class="text-sm">No</span>
                </label>
            </div>
        

            <div class="items-center space-x-2 mb-4 border border-gray-300 rounded-lg p-2">
                <label for="" class="text-sm mr-2 text-gray-700 flex items-center">
                Repeat day/s
                </label>
                
                <div class="flex items-center space-x-4 mt-4 ">
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Left Column: Everyday and first half of the week (Sunday to Tuesday) -->
                        <div class="space-y-2">
                          <label class="flex text-sm items-center text-gray-700 font-bold">
                            <input type="checkbox" class="mr-2" 
                            bind:checked={isEveryday}
                            on:change={toggleEveryday}
                            />
                            Everyday
                          </label>
                          {#each days.slice(0, 3) as day}
                            <label class="flex text-sm items-center text-gray-700">
                              <input
                                type="checkbox"
                                value={day}
                                bind:group={newMenu.repeatDay}
                                on:change={updateEverydayStatus}
                                class="mr-2"
                              />
                               {day}
                            </label>
                          {/each}
                        </div>
                      
                        <!-- Right Column: Second half of the week (Wednesday to Saturday) -->
                        <div class="space-y-2">
                          {#each days.slice(3) as day}
                            <label class="flex text-sm items-center text-gray-700">
                              <input
                                type="checkbox"
                                value={day}
                                bind:group={newMenu.repeatDay}
                                on:change={updateEverydayStatus}
                                class="mr-2"
                              />
                              {day}
                            </label>
                          {/each}
                        </div>
                      </div>
                    
                </div>
                     
                 
            </div>
        
            
            <!-- Buttons: Add Category and Cancel -->
            <div class="flex items-center justify-between space-x-4 mt-6">
                <button 
                    on:click={handleSave} 
                    class="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full sm:w-auto">
                    {isEditing ? 'Update Menu' : 'Add Menu'}
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
        <!-- <div class="flex flex-col w-3/5 mt-5 h-[500px]  overflow-hidden">
            <h2 class="text-lg mb-2">Select Food Items</h2>
            <div class="grid grid-cols-3 h-full p-4 gap-4 border border-gray-300 rounded-lg overflow-y-auto">
              {#each lstFooditems as fooditem}
                <div class="relative">
                  <img
                    src={fooditem.image}
                    alt={fooditem.name}
                    class="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  <p class="absolute bottom-2 left-2 text-white font-bold bg-black bg-opacity-60 px-2 py-1 rounded-md">
                    {fooditem.name}
                  </p>
                </div>
              {/each}
            </div>
        </div> -->
        
    </div>
</div>