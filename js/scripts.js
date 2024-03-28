const SUPABASE_URL = 'https://maadrhlfskixjddjrtxm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWRyaGxmc2tpeGpkZGpydHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyNjUyODYsImV4cCI6MjAyNjg0MTI4Nn0.3EI3Y-QQCXLVxVLmpXychjQ5Ed-r7kSBRvI7in3cc24';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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


