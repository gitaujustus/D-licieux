const SUPABASE_URL = 'https://maadrhlfskixjddjrtxm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWRyaGxmc2tpeGpkZGpydHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyNjUyODYsImV4cCI6MjAyNjg0MTI4Nn0.3EI3Y-QQCXLVxVLmpXychjQ5Ed-r7kSBRvI7in3cc24';

let _supabase = ''

if (navigator.onLine) {
  // console.log("online");
 _supabase= supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}


// Fetch recipes from db
document.addEventListener("DOMContentLoaded", async function() {
    const recipesContainer = document.querySelector(".recipe-list");
  
    // Open (or create) the IndexedDB database and object store
    const request = indexedDB.open('recipesDB', 1);
    let db;
  
    request.onerror = function(event) {
      console.error("Database error: ", event.target.errorCode);
    };
  
    request.onupgradeneeded = function(event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
      }
    };
  
    request.onsuccess = async function(event) {
        db = event.target.result;
        // console.log("Database opened successfully", db);
      
        try {
          let recipesonline;
          let recipeoffline;
          if (navigator.onLine) {
            // console.log("he is online");
            const { data, error } = await _supabase.from('recipes').select('*');
            if (error) throw error;
            recipesonline = data;

             // Update IndexedDB with the latest data from Supabase only if it has changed
            const transaction = db.transaction(['recipes'], 'readwrite');
            const objectStore = transaction.objectStore('recipes');
            const getAllRequest = objectStore.getAll();
      
            getAllRequest.onsuccess = async function(e) {
              const existingRecipes = e.target.result;
              //update the online db if there is changes in local
              await updateSupabaseWithLocalData(existingRecipes, db);
              const existingIds = new Set(existingRecipes.map(recipe => recipe.recipe_id));
              // Use a transaction to perform the update
              const updateTransaction = db.transaction(['recipes'], 'readwrite');
              const updateObjectStore = updateTransaction.objectStore('recipes');
      
              for (const recipe of recipesonline) {
                if (!existingIds.has(recipe.recipe_id)) {
                  // console.log("recipe are passing here", recipe);
                  updateObjectStore.put(recipe);
                } 
              }
            }

          } else {
            console.log("data extracted from offline DB");
            const transaction = db.transaction(['recipes'], 'readonly');
            const objectStore = transaction.objectStore('recipes');
            const request = objectStore.getAll();
            recipeoffline=request;
          }
            if (recipesonline) {
              recipesonline.forEach(recipe => {
                const recipeItem = document.createElement("li");
                recipeItem.innerHTML = `
                  <div class="" key="${recipe.recipe_id}">
                    <h2>${recipe.title}</h2>
                     <p><b>Ingredients</b>: ${recipe.ingredients}</p>
                  </div>
                `;
                recipeItem.addEventListener("click", () => {
                  window.location.href = `/each/recipe.html?id=${encodeURIComponent(recipe.recipe_id)}`;
                });
                recipesContainer.appendChild(recipeItem);
              });
            }
            else{
              recipeoffline.onsuccess= function(e){
                const recipes=e.target.result;
                console.log(recipes);
                recipes.forEach(recipe => {
                  const recipeItem = document.createElement("li");
                  recipeItem.innerHTML = `
                    <div class="" key="${recipe.recipe_id}">
                      <h2>${recipe.title}</h2>
                       <p><b>Ingredients</b>: ${recipe.ingredients}</p>
                    </div>
                  `;
                  recipeItem.addEventListener("click", () => {
                    window.location.href = `/each/recipe.html?id=${encodeURIComponent(recipe.recipe_id)}`;
                  });
                  recipesContainer.appendChild(recipeItem);
                });
              }
            }
            request.onerror = function(e) {
              console.error("Error fetching recipes from IndexedDB", e.target.error);
            };
          
        } catch (error) {
          // console.error("The error is ", error);
          alert('An error occurred while fetching the recipes. Please try again later.');
        }
      };
               
  });

  const updateSupabaseWithLocalData = async (localRecipes, db) => {
    for (const localRecipe of localRecipes) {
      // If the local recipe does not have a recipe_id, it means it was created offline
      if (!localRecipe.recipe_id) {
        const { data, error: insertError } = await _supabase
          .from('recipes')
          .insert([
            { title: localRecipe.title, ingredients: localRecipe.ingredients, steps: localRecipe.steps }
        ]);
  
        if (insertError) {
          console.error('Error inserting recipe into Supabase: ', insertError);
        } else {
          alert('Your Offline recipe has been synchronized:');
          // Now delete the local recipe from IndexedDB
          const deleteTransaction = db.transaction(['recipes'], 'readwrite');
          const deleteObjectStore = deleteTransaction.objectStore('recipes');
          const deleteRequest =deleteObjectStore.delete(localRecipe.id); // Assuming local_id is the key in the local IndexedDB
          
          deleteRequest.onsuccess = () => {
            // console.log(`Successfully deleted local recipe with ID: ${localRecipe.local_id}`);
          };
  
          deleteRequest.onerror = (event) => {
            // console.error('Error deleting local recipe:', event.target.error);
          };
        }
      }
    }
  };
