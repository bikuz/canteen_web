<script>
  import { onMount } from 'svelte';
  // import { page } from '$app/stores';
  import { goto } from '$app/navigation';

//   let token: string | null = null;
  let isLoading = false;
  let error = '';
  let success = false;
  let showConfirmation = false;

  // Get token from localStorage (adjust based on your auth storage)
  onMount(() => {
    // token = localStorage.getItem('authToken');
  });

  const handleDeleteAccount = async () => {
    if (!token) {
      console.error('You must be logged in to delete your account');
      return;
    }

    isLoading = true;
   

    try {
        await api.deleteItem(id, {
            endPoint: 'users/me',
            onSuccess: () => {
                success=true;
                setTimeout(() => goto('/'), 3000);
            },
            onError: (err) => {error=err.message},
        });
    } catch (err) {
        error='Network error. Please try again.';
        // console.error('Unexpected error:', error);
    } finally {
      isLoading = false;
    }
  };
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
    {#if success}
      <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            class="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 class="mt-3 text-lg font-medium text-gray-900">Account Deleted</h2>
        <p class="mt-2 text-sm text-gray-500">
          Your account has been successfully anonymized. You will be redirected shortly.
        </p>
      </div>
    {:else}
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Delete Your Account</h2>
        
        {#if !showConfirmation}
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <div class="text-sm text-yellow-700">
                  <strong>Important:</strong> This action will:
                  <ul class="list-disc text-left pl-5 mt-2 space-y-1">
                    <li>Anonymize your personal information (firstname, lastname, username, email, phone etc.)</li>
                    <li>Retain transaction records for financial analysis</li>
                    <li>Permanently disable your login</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            on:click={() => showConfirmation = true}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Continue to Delete Account
          </button>
        {:else}
          <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  Are you sure you want to anonymize your account? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {#if error}
            <div class="mb-4 text-sm text-red-600">{error}</div>
          {/if}

          <div class="flex space-x-4">
            <button
              on:click={() => showConfirmation = false}
              class="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              on:click={handleDeleteAccount}
              class="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isLoading}
            >
              <!-- {isLoading ? (
                <div class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </div>
              ) : (
                'Confirm Deletion'
              )} -->
                Confirm Deletion
            </button>
          </div>
        {/if}

        <p class="mt-4 text-xs text-gray-500">
          By proceeding, you agree to our{' '}
          <a
            href="/privacypolicy/index.html"
            class="font-medium text-indigo-600 hover:text-indigo-500"
            >Privacy Policy</a
          >.
        </p>
      </div>
    {/if}
  </div>
</div>