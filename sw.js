const staticAssets= 'static-site-v2'
const dynamicAssets= 'dynamic-site-v2'

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
    '/images/icons/icon-512x512.png',
    '/images/icons/icon-144x144.png',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-384x384.png',
    '/images/icons/icon-72x72.png',
    '/images/icons/icon-96x96.png',
    '/images/Recipe.jpeg',
    '/manifest.json',
    '/js/fetch.js'
]
// Install service worke
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticAssets).then(cache => {
            return cache.addAll(assets).catch(error => {
                // If any file fails to cache, you'll et an error here
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


self.addEventListener('fetch', event => {
    if (event.request.url.includes('supabase.co')) {
        // console.log("here", event.request.url)
        event.respondWith(
            fetch(event.request).catch((error) => {
                caches.match('/fallback.html')
            })
        );
        return;
    }  
    if (event.request.url.includes('unpkg.com/@supabase/supabase')) {
        // console.log("here", event.request.url)
        event.respondWith(
            fetch(event.request).catch((error) => {
                caches.match('/fallback.html')
            })
        );
        return;
    }  
    if (event.request.url.includes('nodemailer-server-rouge')) {
        event.respondWith(
            fetch(event.request).catch((error) => {
                // console.log("No network", error);
                // caches.match('/fallback.html')
            })
        );
        return;
    }  
        // For other requests, use caching strategy
        event.respondWith(
            caches.match(event.request)
            .then(cacheRes => {
                // If cache exists, respond with cached content
                if (cacheRes) {
                    return cacheRes;
                }
                // If not in cache, fetch from network and cache dynamicallyy
                return fetch(event.request).then(fetchRes => {
                    return caches.open(dynamicAssets).then(cache => {
                        cache.put(event.request.url, fetchRes.clone());
                        return fetchRes;
                    });
                });
            }).catch(() => {
                // If request fails and it's an HTML request, respond with fallback
                if (event.request.url.includes('.html')) {
                    return caches.match('/fallback.html');
                }
            })
        );
});


    


