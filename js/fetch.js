const SUPABASE_URL = 'https://maadrhlfskixjddjrtxm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWRyaGxmc2tpeGpkZGpydHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyNjUyODYsImV4cCI6MjAyNjg0MTI4Nn0.3EI3Y-QQCXLVxVLmpXychjQ5Ed-r7kSBRvI7in3cc24';

let _supabase = ''

if (navigator.onLine) {
  console.log("online");
 _supabase= supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}else{
  console.log("sdjsd");
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
        console.log("Database opened successfully", db);
      
        try {
          let recipesonline;
          let recipeoffline;
          if (navigator.onLine) {
            console.log("he is online");
            const { data, error } = await _supabase.from('recipes').select('*');
            if (error) throw error;
            recipesonline = data;
      
            // // Update IndexedDB with the latest data from Supabase
            // const transaction = db.transaction(['recipes'], 'readwrite');
            // const objectStore = transaction.objectStore('recipes');
            // recipesonline.forEach(recipe => objectStore.put(recipe));


             // Update IndexedDB with the latest data from Supabase only if it has changed
            const transaction = db.transaction(['recipes'], 'readwrite');
            const objectStore = transaction.objectStore('recipes');
            const getAllRequest = objectStore.getAll();
      
            getAllRequest.onsuccess = async function(e) {
              const existingRecipes = e.target.result;
              const existingIds = new Set(existingRecipes.map(recipe => recipe.recipe_id));
              console.log("existingIds=====", existingIds);
      
              // Use a transaction to perform the update
              const updateTransaction = db.transaction(['recipes'], 'readwrite');
              const updateObjectStore = updateTransaction.objectStore('recipes');
      
              for (const recipe of recipesonline) {
                if (!existingIds.has(recipe.recipe_id)) {
                  console.log("recipe are passing here", recipe);
                  // updateObjectStore.add(recipe);
                  updateObjectStore.put(recipe);
                } 
                else{
                  console.log("Database is already synchronized");
                }
                // else {
                //   const getRecipeRequest = updateObjectStore.get(recipe.recipe_id);
                //   getRecipeRequest.onsuccess = function() {
                //     const existingRecipe = getRecipeRequest.result;
                //     console.log("existingRecipe ssss", existingRecipe);
                //     // Compare the existing recipe with the new data
                //     if (JSON.stringify(existingRecipe) !== JSON.stringify(recipe)) {
                //       updateObjectStore.put(recipe);
                //     }
                //   };
                // }
              }
            }

          } else {
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
          console.error("The error is ", error);
          alert('An error occurred while fetching the recipes. Please try again later.');
        }
      };
               
  });





// //fetch recipes to db
// document.addEventListener("DOMContentLoaded", async function() {
//   const recipesContainer = document.querySelector(".recipe-list");
//   const loadingScreen = document.getElementById("loading-screen");
//   // loadingScreen.style.display = "block";
//   try {
//       const { data: recipes, error } = await _supabase.from('recipes').select('*');
//       if (error) {
//         console.log(error);
//           throw new Error("No recipes to show. Please try again later.");
//       }
//       // loadingScreen.style.display = "none";
//       recipes.forEach(recipe => {
//           const recipeItem = document.createElement("li");
//           recipeItem.innerHTML = `
//               <div class="" key="${recipe.recipe_id}">
//                   <h2>${recipe.title}</h2>
//                   <p><b>Ingredients</b>: ${recipe.ingredients}</p>
//               </div>
//           `;
//           recipeItem.addEventListener("click", () => {
//               // Redirect to full recipe page
//               window.location.href = `/each/recipe.html?id=${encodeURIComponent(recipe.recipe_id)}`;
//           });
//           recipesContainer.appendChild(recipeItem);
//       });
//   } catch (error) {
//     const offline=document.createElement('div')
//         offline.innerHTML=`
//         <div id="loading-screen" style="text-align: center; height: 40vh; padding-top: 70px; color: #d43b20;" >
//             <h4>Opps!</h4>
//             <h2>It seems that you are Offline!</h2>
//             <h3>Check your internet connection and try again</h3>
//         </div>
//         `
//       // loadingScreen.style.display = "none";
//       recipesContainer?.appendChild(offline);
//   }
// });




// // submit recipes to db
// const recipeForm = document.getElementById('recipe-form');

// recipeForm?.addEventListener('submit', async function(event) {
//     event.preventDefault(); // Prevent the default form submission

//     // Get the values from the form fields
//     const title = document.getElementById('title').value.trim(); // Remove leading and trailing whitespace
//     const ingredients = document.getElementById('ingredients').value.trim();
//     const steps = document.getElementById('steps').value.trim();

//     // Validate the form fields
//     if (!title || !ingredients || !steps) {
//         alert('Please fill in all fields');
//         return; // Exit the function early if any field is empty
//     }

//     // Insert the recipe into the database
//     const { data, error } = await _supabase
//         .from('recipes')
//         .insert([
//             { title: title, ingredients: ingredients, steps: steps }
//         ]);

//     if (error) {
//         console.error('Error inserting data: ', error);
//         alert('An error occurred while adding the recipe. Please try again later.');
//     } else {
//         console.log('Data inserted successfully: ', data);
//         recipeForm.reset(); // This will clear the form fields
//         alert('Recipe added successfully!');
//     } 
// });






// //fetch single recipe
// document.addEventListener("DOMContentLoaded", async function() {
//   const recipeTitle = document.getElementById("recipe-title");
//   const recipeIngredients = document.getElementById("recipe-ingredients");
//   const recipeSteps = document.getElementById("recipe-steps");
//   const recipeContainer = document.getElementById("recipe-container");
//   const loadingScreen = document.getElementById("loading-screen");

//   const urlParams = new URLSearchParams(window.location.search);
//   const recipeId = urlParams.get('id');

//     // Show loading screen
//     // loadingScreen?.style.display = "block";

//     try {
        
//   const { data: recipeData, error } = await _supabase
//   .from('recipes')
//   .select('*')
//   .eq('recipe_id', recipeId);
//   if (error) {
//     console.log(error);
//       throw new Error("No recipes to show. Please try again later.");
//   }
  

//   const recipe = recipeData[0];
//   recipeTitle.textContent = recipe.title;


//   const ingredients = recipe.ingredients.split(',').map(ingredient => ingredient.trim()); // Splitting the ingredients paragraph by commas
//   ingredients.forEach(ingredient => {
//     const li = document.createElement("li");
//     li.textContent = ingredient;
//     recipeIngredients.appendChild(li);
//   });
  

//   const steps = recipe.steps.split('.').filter(step => step.trim() !== ''); // Splitting the steps paragraph by full stops
//   steps.forEach(step => {
//     const li = document.createElement("li");
//     li.textContent = step.trim(); // Trimming extra spaces
//     recipeSteps.appendChild(li);

//     // Hide loading screen
//     loadingScreen.style.display = "none";
//     recipeContainer.style.display = "block";
//   });
//     } catch (error) {
//         loadingScreen.style.display = "none";
//         recipeContainer.style.display = "block";
//         const offline=document.createElement('div')
//         offline.innerHTML=`
//         <div id="loading-screen" style="text-align: center; height: 40vh; padding-top: 70px; color: #d43b20;" >
//             <h4>Opps!</h4>
//             <h2>It seems that you are Offline!</h2>
//             <h3>Check your internet connection and try again</h3>
//         </div>
//         `
//       recipeContainer.appendChild(offline);
//     }
// });


