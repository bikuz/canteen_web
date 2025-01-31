<script>
    import { getItems } from '../../services/apiHandler';
    
    export let selectedUser = null;
    let searchTerm = '';
    let users = [];
    let showResults = false;

    async function searchUsers() {
        if (searchTerm.length < 2) {
            users = [];
            return;
        }
        
        try {
            await getItems({
                endPoint: `users/search?search=${searchTerm}`,
                onSuccess: (response) => {
                    // Transform the response data to include profile information
                    users = response.data.map(user => ({
                        _id: user._id,
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName,
                        phoneNumber: user.profile.phoneNumber,
                        email: user.profile.email,
                        username: user.username
                    }));
                    showResults = true;
                }
            });
        } catch (error) {
            console.error('Failed to search users:', error);
            users = [];
        }
    }

    function selectUser(user) {
        selectedUser = user;
        searchTerm = `${user.firstName} ${user.lastName}`;
        showResults = false;
    }

    function clearSelection() {
        selectedUser = null;
        searchTerm = '';
        showResults = false;
    }
</script>

<div class="relative">
    <div class="flex gap-2">
        <input 
            type="text"
            bind:value={searchTerm}
            on:input={searchUsers}
            placeholder="Search user by name, username or email..."
            class="flex-1 pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {#if selectedUser}
            <button 
                on:click={clearSelection}
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Clear
            </button>
        {/if}
    </div>
    
    {#if showResults && users.length > 0}
        <div class="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {#each users as user}
                <div 
                    class="p-2 hover:bg-gray-100 cursor-pointer"
                    on:click={() => selectUser(user)}
                >
                    <p class="font-semibold">{user.firstName} {user.lastName}</p>
                    <p class="text-sm text-gray-600">{user.phoneNumber}</p>
                    <p class="text-xs text-gray-500">{user.email}</p>
                </div>
            {/each}
        </div>
    {:else if showResults && searchTerm.length >= 2}
        <div class="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-2">
            No users found
        </div>
    {/if}
</div> 