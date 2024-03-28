

const SUPABASE_URL = 'https://maadrhlfskixjddjrtxm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWRyaGxmc2tpeGpkZGpydHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyNjUyODYsImV4cCI6MjAyNjg0MTI4Nn0.3EI3Y-QQCXLVxVLmpXychjQ5Ed-r7kSBRvI7in3cc24';

let _supabase = ''

if (navigator.onLine) {
 _supabase= supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}



//fetch single recipe
document.addEventListener("DOMContentLoaded", async function() {
    const recipeTitle = document.getElementById("recipe-title");
    const recipeIngredients = document.getElementById("recipe-ingredients");
    const recipeSteps = document.getElementById("recipe-steps");
    const recipeContainer = document.getElementById("recipe-container");
    const loadingScreen = document.getElementById("loading-screen");

    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

      // Open (or create) the IndexedDB database and object store
      const request = indexedDB.open('recipesDB', 1);
      let db;
    
      request.onerror = function(event) {
        console.error("Database error: ", event.target.errorCode);
      };

 
      // Show loading screen
      loadingScreen.style.display = "block";

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
        //   console.log("Database opened successfully", db);

      

      try {
        let recipesonline;
        let recipeoffline;
        if (navigator.onLine) {
          // console.log("Oh yes, user is online");
           const { data: recipeData, error } = await _supabase
            .from('recipes')
            .select('*')
            .eq('recipe_id', recipeId);
          if (error) throw error;
          recipesonline = recipeData;

        } else {
          // console.log("Oh No, user is offline. lets feed them cached content");
          const transaction = db.transaction(['recipes'], 'readonly');
          const objectStore = transaction.objectStore('recipes');
          const request = objectStore.getAll();
          console.log(request);
          recipeoffline=request;
        }
          if (recipesonline) {
             //hide loading scrren and show recipes
             loadingScreen.style.display = "none";
             recipeContainer.style.display = "block";

            const recipe = recipesonline[0];
            recipeTitle.textContent = recipe.title;
    
      
            const ingredients = recipe.ingredients.split(',').map(ingredient => ingredient.trim()); // Splitting the ingredients paragraph by commas
            ingredients.forEach(ingredient => {
              const li = document.createElement("li");
              li.textContent = ingredient;
              recipeIngredients.appendChild(li);
            });

            const steps = recipe.steps.split('.').filter(step => step.trim() !== ''); // Splitting the steps paragraph by full stops
            steps.forEach(step => {
              const li = document.createElement("li");
              li.textContent = step.trim(); // Trimming extra spaces
              recipeSteps.appendChild(li);
      
              // Hide loading screen
              loadingScreen.style.display = "none";
              recipeContainer.style.display = "block";
            });

          }
          else{
            recipeoffline.onsuccess= function(e){
                //hide loading scrren and show recipes
                loadingScreen.style.display = "none";
                recipeContainer.style.display = "block";

              const recipes=e.target.result;
              const recipe = recipes.find(r => r.recipe_id === parseInt(recipeId))
              recipeTitle.textContent = recipe.title;
      

              const ingredients = recipe.ingredients.split(',').map(ingredient => ingredient.trim()); // Splitting the ingredients paragraph by commas
              ingredients.forEach(ingredient => {
                const li = document.createElement("li");
                li.textContent = ingredient;
                recipeIngredients.appendChild(li);
              });

              const steps = recipe.steps.split('.').filter(step => step.trim() !== ''); // Splitting the steps paragraph by full stops
              steps.forEach(step => {
                const li = document.createElement("li");
                li.textContent = step.trim(); // Trimming extra spaces
                recipeSteps.appendChild(li);
        
                // Hide loading screen
                loadingScreen.style.display = "none";
                recipeContainer.style.display = "block";
              });
            }
          }
           
          request.onerror = function(e) {
            console.error("Error fetching recipes from IndexedDB", e.target.error);
          };
        
      } catch (error) {
        console.error("The error is ", error);
        alert('An error occurred while fetching the recipes. Please try again later.');
      }
    }
  });







// // Fetch recipes from db
// document.addEventListener("DOMContentLoaded", async function() {
//     const recipesContainer = document.querySelector(".recipe-list");
  
//     // Open (or create) the IndexedDB database and object store
//     const request = indexedDB.open('recipesDB', 1);
//     let db;
  
//     request.onerror = function(event) {
//       console.error("Database error: ", event.target.errorCode);
//     };
  
//     request.onupgradeneeded = function(event) {
//       db = event.target.result;
//       if (!db.objectStoreNames.contains('recipes')) {
//         db.createObjectStore('recipes', { keyPath: 'id', autoIncrement: true });
//       }
//     };
  
//     request.onsuccess = async function(event) {
//         db = event.target.result;
//         console.log("Database opened successfully", db);
      
//         try {
//           let recipesonline;
//           let recipeoffline;
//           if (navigator.onLine) {
//             console.log("he is online");
//             const { data, error } = await _supabase.from('recipes').select('*');
//             if (error) throw error;
//             recipesonline = data;
      

//              // Update IndexedDB with the latest data from Supabase only if it has changed
//             const transaction = db.transaction(['recipes'], 'readwrite');
//             const objectStore = transaction.objectStore('recipes');
//             const getAllRequest = objectStore.getAll();
      
//             getAllRequest.onsuccess = async function(e) {
//               const existingRecipes = e.target.result;
//               const existingIds = new Set(existingRecipes.map(recipe => recipe.recipe_id));
//               // Use a transaction to perform the update
//               const updateTransaction = db.transaction(['recipes'], 'readwrite');
//               const updateObjectStore = updateTransaction.objectStore('recipes');
      
//               for (const recipe of recipesonline) {
//                 if (!existingIds.has(recipe.recipe_id)) {
//                   console.log("recipe are passing here", recipe);
//                   // updateObjectStore.add(recipe);
//                   updateObjectStore.put(recipe);
//                 } 
//                 else{
//                   console.log("Database is already synchronized");
//                 }
//               }
//             }

//           } else {
//             const transaction = db.transaction(['recipes'], 'readonly');
//             const objectStore = transaction.objectStore('recipes');
//             const request = objectStore.getAll();
//             recipeoffline=request;
//           }
//             if (recipesonline) {
//               recipesonline.forEach(recipe => {
//                 const recipeItem = document.createElement("li");
//                 recipeItem.innerHTML = `
//                   <div class="" key="${recipe.recipe_id}">
//                     <h2>${recipe.title}</h2>
//                      <p><b>Ingredients</b>: ${recipe.ingredients}</p>
//                   </div>
//                 `;
//                 recipeItem.addEventListener("click", () => {
//                   window.location.href = `/each/recipe.html?id=${encodeURIComponent(recipe.recipe_id)}`;
//                 });
//                 recipesContainer.appendChild(recipeItem);
//               });
//             }
//             else{
//               recipeoffline.onsuccess= function(e){
//                 const recipes=e.target.result;
//                 console.log(recipes);
//                 recipes.forEach(recipe => {
//                   const recipeItem = document.createElement("li");
//                   recipeItem.innerHTML = `
//                     <div class="" key="${recipe.recipe_id}">
//                       <h2>${recipe.title}</h2>
//                        <p><b>Ingredients</b>: ${recipe.ingredients}</p>
//                     </div>
//                   `;
//                   recipeItem.addEventListener("click", () => {
//                     window.location.href = `/each/recipe.html?id=${encodeURIComponent(recipe.recipe_id)}`;
//                   });
//                   recipesContainer.appendChild(recipeItem);
//                 });
//               }
//             }
             
      
//             request.onerror = function(e) {
//               console.error("Error fetching recipes from IndexedDB", e.target.error);
//             };
          
//         } catch (error) {
//           console.error("The error is ", error);
//           alert('An error occurred while fetching the recipes. Please try again later.');
//         }
//       };
               
//   });


