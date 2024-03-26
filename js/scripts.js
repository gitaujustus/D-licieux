const SUPABASE_URL = 'https://maadrhlfskixjddjrtxm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWRyaGxmc2tpeGpkZGpydHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyNjUyODYsImV4cCI6MjAyNjg0MTI4Nn0.3EI3Y-QQCXLVxVLmpXychjQ5Ed-r7kSBRvI7in3cc24';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)



//fetch single recipe
    document.addEventListener("DOMContentLoaded", async function() {
      const recipeTitle = document.getElementById("recipe-title");
      const recipeIngredients = document.getElementById("recipe-ingredients");
      const recipeSteps = document.getElementById("recipe-steps");
      const recipeContainer = document.getElementById("recipe-container");
      const loadingScreen = document.getElementById("loading-screen");

      const urlParams = new URLSearchParams(window.location.search);
      const recipeId = urlParams.get('id');
   
        // Show loading screen
        loadingScreen.style.display = "block";

        try {
            
      const { data: recipeData, error } = await _supabase
      .from('recipes')
      .select('*')
      .eq('recipe_id', recipeId);
      if (error) {
        console.log(error);
          throw new Error("No recipes to show. Please try again later.");
      }
      

      const recipe = recipeData[0];
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
        } catch (error) {
            loadingScreen.style.display = "none";
            recipeContainer.style.display = "block";
            const offline=document.createElement('div')
            offline.innerHTML=`
            <div id="loading-screen" style="text-align: center; height: 40vh; padding-top: 70px; color: #d43b20;" >
                <h4>Opps!</h4>
                <h2>It seems that you are Offline!</h2>
                <h3>Check your internet connection and try again</h3>
            </div>
            `
          recipeContainer.appendChild(offline);
        }
    });




// submit recipes to db
const recipeForm = document.getElementById('recipe-form');

recipeForm?.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the form fields
    const title = document.getElementById('title').value.trim(); // Remove leading and trailing whitespace
    const ingredients = document.getElementById('ingredients').value.trim();
    const steps = document.getElementById('steps').value.trim();

    // Validate the form fields
    if (!title || !ingredients || !steps) {
        alert('Please fill in all fields');
        return; // Exit the function early if any field is empty
    }

    // Insert the recipe into the database
    const { data, error } = await _supabase
        .from('recipes')
        .insert([
            { title: title, ingredients: ingredients, steps: steps }
        ]);

    if (error) {
        console.error('Error inserting data: ', error);
        alert('An error occurred while adding the recipe. Please try again later.');
    } else {
        console.log('Data inserted successfully: ', data);
        recipeForm.reset(); // This will clear the form fields
        alert('Recipe added successfully!');
    } 
});








