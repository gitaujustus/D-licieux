const SUPABASE_URL = "https://maadrhlfskixjddjrtxm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYWRyaGxmc2tpeGpkZGpydHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEyNjUyODYsImV4cCI6MjAyNjg0MTI4Nn0.3EI3Y-QQCXLVxVLmpXychjQ5Ed-r7kSBRvI7in3cc24";

let _supabase = "";

if (navigator.onLine) {
  _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Check if the user is online or offline
const isOnline = () => navigator.onLine;



// Function to insert data into IndexedDB
const insertIntoIndexedDB = async (title, ingredients, steps) => {

  //perform operation only if the DB is opened successfully
  request.onsuccess = function (event) {
    db = event.target.result;
    // Open a transaction to your IndexedDB's 'recipes' object store
    const transaction = db.transaction(["recipes"], "readwrite");
    const objectStore = transaction.objectStore("recipes");
    // Add the recipe data to the object store
    objectStore.add({ title, ingredients, steps });
    // console.log("items added locally");
  };
};


const recipeForm = document.getElementById('recipe-form');
// Event listener for the form submission
recipeForm?.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the values from the form fields
  const title = document.getElementById("title").value.trim();
  const ingredients = document.getElementById("ingredients").value.trim();
  const steps = document.getElementById("steps").value.trim();

 

// Define your IndexedDB database
let db;

// Open a connection to the IndexedDB
const request = indexedDB.open("recipesDB", 1);

request.onerror = function (event) {
  // Handle errors when opening the database
  console.error("Database error: ", event.target.error);
};

request.onupgradeneeded = function (event) {
  // Create an object store if it doesn't exist
  const db = event.target.result;
  db.createObjectStore("recipes", { keyPath: "id", autoIncrement: true });
};



 // Validate the form fields
 if (!title || !ingredients || !steps) {
    alert("Please fill in all fields");
    return;
  }

  if (isOnline()) {
    // Insert the recipe into Supabase
    const { data, error } = await _supabase
      .from("recipes")
      .insert([{ title, ingredients, steps }]);

    if (error) {
      console.error("Error inserting data: ", error);
      alert(
        "An error occurred while adding the recipe. Please try again later."
      );
    } else {
    //   console.log("Data inserted successfully: ", data);
      recipeForm.reset();
      alert("Recipe added successfully!");
    }
  } else {

    // Insert the recipe into IndexedDB
    // await insertIntoIndexedDB(title, ingredients, steps);
    request.onsuccess = function (event) {
        db = event.target.result;
        // Open a transaction to your IndexedDB's 'recipes' object store
        const transaction = db.transaction(["recipes"], "readwrite");
        const objectStore = transaction.objectStore("recipes");
        // Add the recipe data to the object store
        objectStore.add({ title, ingredients, steps });
        // console.log("items added locally");
        alert(
            "You are offline. The recipe will be added once you are back online."
          );
      };

  
  }
});

