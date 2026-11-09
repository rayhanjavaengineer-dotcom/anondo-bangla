ANONDO BANGLA — PWA INSTALL UPDATE
==================================

Repository already contains:
- manifest.json
- sw.js
- icon-192.png
- icon-512.png
- icon-maskable-512.png
- existing service-worker registration in index.html

This update adds the missing install experience and refreshes offline caching.

FILES
-----
install.js                  New cross-platform install button + install help
manifest.json               Updated PWA manifest
sw.js                       Updated offline cache (v9)
INDEX-HEAD-ADDITION.txt     Add iOS home-screen icon metadata
INDEX-BODY-ADDITION.txt     Load install.js before </body>

INTEGRATION
-----------
1. Upload/replace install.js at repository root.
2. Replace manifest.json and sw.js at repository root.
3. In index.html, inside <head>, add:
   <link rel="apple-touch-icon" href="icon-192.png">
4. In index.html, immediately before </body>, add:
   <script src="install.js"></script>
5. Keep the existing manifest link:
   <link rel="manifest" href="manifest.json">
6. Keep the existing registerServiceWorker() function and its call.
   Do not add a second service-worker registration.

PLATFORM BEHAVIOUR
------------------
Android / supported desktop browsers:
- Uses beforeinstallprompt when the browser makes it available.
- The Install App button invokes the native install prompt.
- If no prompt is available, it shows browser-menu instructions.

iPhone / iPad:
- iOS does not expose the same install prompt event.
- The button explains Safari Share > Add to Home Screen.

OFFLINE
-------
The updated service worker pre-caches the app shell and install.js.
Previously visited same-origin resources are cached for later offline use.
Live APIs, remote images and uncached dynamic data still require connectivity.

IMPORTANT
---------
This is a PWA install package, not a Play Store APK.
The original repository could be read, but GitHub rejected write operations
with HTTP 403 ("Resource not accessible by integration"). Therefore these
files are packaged for integration; the live GitHub site has NOT been changed.
