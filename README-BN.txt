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


নতুন Global Edition working build-এ অতিরিক্ত সুবিধা:
- Global Travel Records: নিজের দেশ, স্থান, তারিখ ও স্মৃতি যোগ করে দেশ/স্থান/পয়েন্টের হিসাব।
- Weather & Local Time: Open-Meteo দিয়ে শহরের বর্তমান আবহাওয়া ও স্থানীয় সময় (ইন্টারনেট প্রয়োজন)।
- Destination & Hotel Finder: Google Maps-এ বাহ্যিক সার্চ; কোনো live hotel price বা availability দাবি করা হয় না।
- Currency search: From ও To উভয় মুদ্রার জন্য আলাদা সার্চ; country name matching দেশ-ডেটার currency mapping-এর ওপর নির্ভরশীল।

সীমাবদ্ধতা: Global Country Explorer দেশ-স্তরের; সম্পূর্ণ বিশ্বব্যাপী শহর/প্রদেশ ডেটাবেস, hotel inventory/booking, full in-app routing এবং প্রতিটি tool-এর সম্পূর্ণ অনুবাদ এখনো অন্তর্ভুক্ত নয়।


V19: ৩০টি starter global destination, worldwide wishlist, global trip planner, hotel search date/guest filters এবং official travel-advice link hub যোগ হয়েছে। পূর্ণাঙ্গ verified world catalogue বা hotel live booking integration হিসেবে গণ্য নয়।

v20 APP SHELL UPDATE:
- Home / Explore / Tools / Profile primary navigation added.
- Three-dot Settings menu, language choice, privacy, security, help, about, terms, share and local feedback added.
- Existing light/dark toggle retained.
- See README-V20-BN.txt and QA-REPORT-V20-BN.txt for scope and testing limits.
