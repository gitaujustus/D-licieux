const staticAssets= 'static-site-v3'
const dynamicAssets= 'dynamic-site-v1'

const assets=[
    '/',
    '/index.html',
    '/style.css',
    '/contacts/contacts.html',
    '/contacts/contacts.css',
    '/add/add-recipe.html',
    '/add/add-recipe.css',
    '/about/about.html',
    '/about/about.css',
    '/fallback/fallback.html',
    '/fallback/fallback.css',
    '/each/recipe.html',
    '/each/recipe.css',
    '/js/scripts.js',
    '/images/icons/icon-512x512.png',
    '/images/icons/icon-144x144.png',
    '/images/Recipe.jpeg',
    
]
// Install service work
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticAssets).then(cache => {
            return cache.addAll(assets).catch(error => {
                // If any file fails to cache, you'll get an error here
                console.error('Failed to cachee', error);
            });
        })
    );
});

self.addEventListener('activate', event =>{
    event.waitUntil(
        caches.keys().then(keys =>{
            return Promise.all(keys
                .filter(key => key !== staticAssets  && key !== dynamicAssets)
                .map(key => caches.delete(key)
                )
            )
        })
    )
})

// self.addEventListener('fetch', event =>{
//     event.respondWith(
//         caches.match(event.request).then(cacheRes =>{
//             return cacheRes || fetch(event.request).then(fetchRes =>{
//                 return caches.open(dynamicAssets).then(cache =>{
//                     cache.put(event.request.url, fetchRes.clone())
//                     return fetchRes;
//                 }).catch(()=> {
//                     console.log("sss");
//                     if (event.request.url.indexOf('.html')> -1) {
//                         return caches.match('/fallback.html')
//                     }
//                 })
//             })
//         })
//     )
     
// })

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(cacheRes => {
            return cacheRes || fetch(event.request).then(fetchRes => {
                // Check if we received a valid response
                if (!fetchRes.ok) {
                    throw Error('Network response was not ok.');
                }
                return caches.open(dynamicAssets).then(cache => {
                    cache.put(event.request.url, fetchRes.clone());
                    return fetchRes;
                });
            });
        }).catch(() => {
            // Handle exceptions from both caches.match() and fetch()
            console.log("Fallback to offline page");
            return caches.match('/fallback/fallback.html');
        })
    );
});

