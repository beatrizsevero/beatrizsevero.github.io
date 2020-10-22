'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "ea73dcfed1f6052042f88fc8736d5e04",
"assets/assets/fonts/Quicksand-Regular.ttf": "216d43ee8707910af457af569eda1dec",
"assets/assets/fonts/Rajdhani-Regular.ttf": "fb987593d286bb6bd93d3de8457c5eb4",
"assets/assets/icons/behance.png": "9c7c88a7198abacc69bbc9f28b9e6e4d",
"assets/assets/icons/instagram.png": "fa90e1e7734e5bef1193daca074ad67c",
"assets/assets/icons/linkedin.png": "a073ecdfc08870a4b033b6869c7f48fa",
"assets/assets/images/1.jpg": "e3fecc1c7f3d7f0179eb5baf3aeb4048",
"assets/assets/images/10.jpg": "17503326bd751ee4041597656171d911",
"assets/assets/images/11.jpg": "f5d5d03f08802f5a80f461c6dfccc961",
"assets/assets/images/12.jpg": "7d1fb86d31d05c275c6fb909f22b0206",
"assets/assets/images/13.jpg": "39c350e2061319ed03e05c5289fbb754",
"assets/assets/images/14.jpg": "355860854d6754f55bf18d33f5971f95",
"assets/assets/images/15.jpg": "05caf68549d066524a34a4e2bd0ba346",
"assets/assets/images/16.jpg": "35206a5bdf28d3fa9f8ba76d26ecc6b9",
"assets/assets/images/17.jpg": "f1c2ea1ef22a0d335055e78f59b6a17d",
"assets/assets/images/18.jpg": "f45507d2bc0db1739722752ed7c27bb5",
"assets/assets/images/2.jpg": "98a0818d4a731d779fc9de1e99278e8a",
"assets/assets/images/3.jpg": "440c90b7d50bfddfed482bd12a5e98a2",
"assets/assets/images/4.jpg": "8592d80a26ea00526e4e976cb777cebc",
"assets/assets/images/5.jpg": "ff8ca3fdba660798a443bb1da4e5875b",
"assets/assets/images/6.jpg": "8336c29db3e2dd15c71d17a27617ecd1",
"assets/assets/images/7.jpg": "4e865a6b9fd7d1332f113ecafa8d1719",
"assets/assets/images/8.jpg": "a48dfe6e8fbfbcaa8c5cc38faaded0bf",
"assets/assets/images/9.jpg": "c5c22bc47c866f8275f456347a1a9b2b",
"assets/assets/others/curriculo.pdf": "d679f4297c6b9092831ff20affffecb7",
"assets/assets/others/profile_picture.jpeg": "da1ee771f80dcb992272d36479a0190b",
"assets/FontManifest.json": "8d8ce205e37b09150f1911d30b5efda5",
"assets/fonts/MaterialIcons-Regular.otf": "a68d2a28c526b3b070aefca4bac93d25",
"assets/NOTICES": "af350ed160b1d3c8f0b18b314228e8c9",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "18c38bac67b5105118718f96b444f01a",
"/": "18c38bac67b5105118718f96b444f01a",
"main.dart.js": "f0e598d8d1c181d3caa4c73031935241",
"manifest.json": "5bed810bb1992bef5a5818d92b667c3f"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list, skip the cache.
  if (!RESOURCES[key]) {
    return event.respondWith(fetch(event.request));
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    return self.skipWaiting();
  }
  if (event.message === 'downloadOffline') {
    downloadOffline();
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
