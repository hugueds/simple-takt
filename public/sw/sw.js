self.addEventListener('install', function(event) {
    console.log(event);
    // Perform install steps
    // event.waitUntil(
    //   caches.open(CACHE_NAME)
    //     .then(function(cache) {
    //       console.log('Opened cache');
    //       return cache.addAll(urlsToCache);
    //     })
    // );
  });