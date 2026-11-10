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

v21 APP SHELL UPDATE:
- Home / Explore / Tools / Profile primary navigation added.
- Three-dot Settings menu, language choice, privacy, security, help, about, terms, share and local feedback added.
- Existing light/dark toggle retained.
- See README-V20-BN.txt and QA-REPORT-V20-BN.txt for scope and testing limits.


V23 STAGE 3 — FIREBASE SECURITY FOUNDATION
- Firebase Web App config restored from the previously supplied configured package for project anondo-bangla-87c40; existing firebase-auth.js left unchanged.
- Added firestore.rules and storage.rules as deployment-ready security-rule drafts.
- Added FIREBASE-SECURITY-FOUNDATION-BN.txt with deployment and testing limitations.
- Service Worker cache version updated to v23-stage3.
- Rules are not yet deployed or emulator-tested; Firestore/Storage social UI and trusted analytics backend remain unfinished.

V23 STAGE 6 — GLOBAL TRAVEL TOOLS
- District Food Guide replaced with World Food Guide (country/cuisine search and meals via TheMealDB; provider coverage limits apply).
- Bangladesh Festival Calendar replaced with World Festival & Holiday Calendar (country/year public holidays via Nager.Date; not a complete cultural festival directory).
- Travel Safety & Emergency now supports searchable country-level general emergency numbers via a Wikipedia-derived dataset; verify locally and do not treat as official guaranteed data.
- Travel Budget Calculator now supports multiple currencies and private local-only persistence. The calculator totals in the selected currency; it does not convert currencies. New budget is not uploaded to Firebase/Community.
- Expense Tracker stores the currency used for each new expense and groups totals by currency.
- See V23-STAGE-6-GLOBAL-TOOLS-CHANGE-NOTES-BN.txt for sources, limitations and QA scope.


V23 STAGE 7 — DESTINATION HIERARCHY
- Added a searchable global hierarchy: Country → Region/State/Province → City → Attraction/Landmark. It uses countries.dev / GeoNames data; coverage depends on available country subdivisions and populated-place records. It is a geographic directory, not a complete official tourism database.
- Attraction search results can open Maps or populate the Global Trip Planner.
- GeoNames attribution: CC BY 4.0. Details: V23-STAGE-7-DESTINATION-HIERARCHY-CHANGE-NOTES-BN.txt.


V23 STAGE 8 — EXIT CONFIRMATION
- In-app Android/PWA Back from a tool returns Home; Back from Home opens the custom “Leaving Anondo Bangla?” confirmation with Stay and Exit App actions.
- A web page cannot guarantee that it can close its own browser/PWA window or intercept every OS/app-switcher/tab-close action. If the browser blocks window.close(), the dialog explains how to close it using device/browser controls.
- See V23-STAGE-8-EXIT-CONFIRMATION-CHANGE-NOTES-BN.txt.


V23 STAGE 9 — PERFORMANCE / REGRESSION
- Feed remains bounded and media is lazy-loaded; redundant per-post follow reads were removed. See V23-STAGE-9-PERFORMANCE-CHANGE-NOTES-BN.txt for what was and was not tested.

- Global Transport & Airport Finder provides geographic airport references and external route comparison/search links. It does not supply verified live timetables or fares.

### Global travel companion coverage notes
- World Food Guide searches all countries/territories; direct recipes are available only for cuisines represented in TheMealDB. Other countries get a country-specific research fallback.
- World Festival & Holiday Calendar uses Nager.Date where supported. Cultural/religious events and unsupported-country holidays may be missing; verify with official organizers/government.
- Global Emergency Contacts uses a community-maintained open dataset and shows dispatch/police/fire/ambulance numbers only where listed. Data may be incomplete/outdated; confirm locally and do not rely on it as the sole emergency source.
- Global Travel Budget is local-only on the current device/browser. It is not uploaded to Firebase or visible to other app users. Device/browser access still means access to the saved budget.
- Legacy Bangladesh district progress remains a separate Bangladesh-specific explorer; global records, wishlist, gallery and journal support worldwide places.
- Transport and airport tools provide geographic references and external route links, not guaranteed live schedules, fares or availability.
