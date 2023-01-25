importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');
importScripts("https://cdn.moengage.com/webpush/releases/serviceworker_cdn.min.latest.js");


const { routing, strategies, cacheableResponse, expiration } = workbox;

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
routing.registerRoute(
    // Check to see if the request's destination is style for stylesheets, script for JavaScript, or worker for web worker
    ({ url }) => new RegExp(/static/).test(url),
    // Use a Stale While Revalidate caching strategy
    new strategies.StaleWhileRevalidate({
      // Put all cached files in a cache named 'assets'
      cacheName: 'assets',
      plugins: [
        // Ensure that only requests that result in a 200 status are cached
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [200],
        }),
        new expiration.ExpirationPlugin({
          maxAgeSeconds: 60 * 60 * 24 * 3, // 3 Days
        })
      ],
    }),
);

// routing.registerRoute(
//   ({url, request}) => new RegExp(/https:\/\/mobilecdn.6thstreet.com/).test(url) && request.destination === 'image',
//   new strategies.CacheFirst({
//     cacheName: 'images',
//     plugins: [
//       new cacheableResponse.CacheableResponsePlugin({statuses: [0, 200]}),
//       new expiration.ExpirationPlugin({
//         maxEntries: 100,
//         maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
//       })
//     ],
//   })
// );

routing.registerRoute(
  ({url, request}) => new RegExp(/(https?:\/\/mobilecdn.6thstreet.com\/.*\.(?:json))/i).test(url),
  new strategies.CacheFirst({
    cacheName: 'JSONs',
    plugins: [
      new cacheableResponse.CacheableResponsePlugin({statuses: [0, 200]}),
      new expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 10, // 10 Minutes
      })
    ],
  })
);

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
