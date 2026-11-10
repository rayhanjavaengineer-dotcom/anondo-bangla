ANONDO BANGLA v23 — GLOBAL TRAVEL PWA
Final source package notes (Bangla)

প্রকল্প
- App: Anondo Bangla — Explore the World. Collect Memories.
- Firebase project: anondo-bangla-87c40
- Static hosting baseline: GitHub Pages (existing repository)
- This package is source-only. It does not push GitHub changes or deploy Firebase automatically.

যা এই v23 source package-এ আছে
1. Premium header Install App / Share App, Explore–Tools–Profile navigation, PWA update cache, and in-app exit confirmation.
2. Global Country Explorer and Country → Region → City → Nearby Attraction hierarchy. Nearby attraction search tries OpenStreetMap Overpass and falls back to GeoNames/map search.
3. Global Destination & Hotel Finder with external booking/search links; no in-app hotel booking or payment.
4. Global Transport & Airport Finder with airport geographic references and external map/transport search links.
5. Global currency converter, weather/local time, distance tools, trip planner and global records.
6. World Food Guide, World Festival & Holiday Calendar and Global Emergency Contacts with country search and honest source/coverage notices.
7. Global wishlist, travel photo gallery and journal. Existing Bangladesh district entries are retained.
8. Global Travel Budget Calculator with currency search, automatic local save, and browser-local privacy. The budget is not sent to Firebase or the public community feed.
9. Firebase community foundation: public feed and stories can be read without sign-in; sign-in is required to publish, like, comment, follow or manage private posts. Public/private posts, image/video uploads, 24-hour public/private stories, likes, comments, follow from posts, own-post deletion and reporting are included.
10. Creator Analytics foundation using server-side Cloud Functions and admin custom claims.
11. Firestore/Storage security rules, indexes, Firebase Functions source, setup notes and QA report.

বিশ্বব্যাপী ডেটা কভারেজ সম্পর্কে গুরুত্বপূর্ণ কথা
- Food: TheMealDB-এর cuisine/area dataset-এ সরাসরি recipe থাকলে দেখাবে। অন্য দেশের জন্য country-specific cuisine research link দেখাবে; কোনো খাবারের নাম বানিয়ে দেখাবে না.
- Festivals: Nager.Date যেখানে public-holiday data দেয় সেখানে দেখাবে। সব সাংস্কৃতিক, ধর্মীয় বা lunar festival সব দেশে পাওয়া যাবে—এমন নিশ্চয়তা নেই। সরকারি/আয়োজকের তথ্য যাচাই করুন.
- Emergency: EmergencyNumberAPI community-maintained dataset-এ যে dispatch/police/fire/ambulance নম্বর আছে শুধু সেগুলো দেখাবে। তথ্য অসম্পূর্ণ বা পুরোনো হতে পারে। জরুরি পরিস্থিতিতে স্থানীয় কর্তৃপক্ষ, হোটেল বা দূতাবাসের নির্দেশনা যাচাই করুন.
- Currency: Budget currency তালিকা live metadata এবং country currency metadata থেকে তৈরি হয়; offline অবস্থায় common-currency fallback থাকে। Exchange-rate converter provider-supported currency-তেই কাজ করবে.
- Hotels/Transport/Airports: External search and geographic references only. Live fare, room availability, departure time, terminal, route or reservation নিশ্চিত করা হয় না.
- Bangladesh 64-district Explorer একটি আলাদা Bangladesh-specific module. Global travel totals-এর সঙ্গে এটি মিশিয়ে দেখানো হয় না.

Budget privacy
- Travel Budget Calculator uses localStorage key `ab_global_private_budget_v1` in the current browser/device.
- No Firestore/Firebase upload is used for this budget.
- একই ডিভাইস/ব্রাউজারে যাদের access আছে তারা browser storage access করতে পারে। Shared device হলে ব্যবহার শেষে clear/reset করুন.
- Backup JSON-এ budget থাকতে পারে; backup file অন্য কাউকে দেবেন না.

Firebase deployment (আপনার অনুমতি ও নিজস্ব account access নিয়ে নিজে চালাবেন)
1. প্রথমে GitHub/hosting-এর live Firebase configuration যাচাই করুন। বিদ্যমান Email/Google login/logout কাজ করলে `firebase-config.js` অকারণে পরিবর্তন করবেন না.
2. Firebase CLI ইনস্টল করে login করুন: `npm install -g firebase-tools` এবং `firebase login`.
3. Project root-এ গিয়ে `firebase use anondo-bangla-87c40` চালান.
4. Rules ও indexes deploy: `firebase deploy --only firestore:rules,firestore:indexes,storage`.
5. Functions dependencies: `cd functions` → `npm install`; তারপর root-এ ফিরে `firebase deploy --only functions`.
6. Cloud Functions deployment-এর জন্য Firebase project-এ billing/Blaze plan প্রয়োজন হতে পারে. Deploy করার আগে Firebase billing, quota ও region যাচাই করুন.
7. Creator Analytics admin claim দিতে trusted workstation-এ Application Default Credentials configure করুন (যেমন `gcloud auth application-default login`), তারপর `cd functions` থেকে `node set-admin-claim.js FIREBASE_AUTH_UID` চালান. UID ছাড়া কাউকে admin করবেন না. Service-account JSON কখনো GitHub-এ commit করবেন না.
8. Admin user sign out করে আবার sign in করবে, যাতে custom claim token refresh হয়.
9. প্রথমে test Firebase project/emulator-এ Rules/Functions যাচাই করে তারপর production deploy করুন.

এই প্যাকেজে করা যাচাই (Stage 12 source checks)
- JavaScript syntax: ১২টি root JS ও ২টি Cloud Functions JS `node --check` pass.
- JSON: manifest, firebase.json, Firestore indexes এবং Functions package JSON parse pass.
- HTML duplicate ID: none (বর্তমান Stage 12 source-এ ২৯১টি ID পরীক্ষা করা হয়েছে).
- HTML local file references, CSS local URL assets, Service Worker precache references: none missing.
- `travel-tools.js`, `global-tools.js` এবং `navigation.js` offline-stub initialization smoke tests pass.
- Firebase Emulator, real browser, Android Chrome device, live external provider calls, Firebase Rules deployment এবং Cloud Functions deployment এই পরিবেশে করা হয়নি.

বর্তমান সীমাবদ্ধতা / পরবর্তী উন্নয়ন
- Community moderation queue, traveler discovery/search, saved-posts, text post editing, profile-photo upload এবং public feed-এর ২৫টি করে cursor pagination যুক্ত হয়েছে. Admin post removal trusted Cloud Function দিয়ে post-এর owned media এবং nested comments/likes মুছে দেয়. নিজের post delete-ও `deleteOwnPost` callable-এর মাধ্যমে owner-check করে media ও nested subcollection পরিষ্কার করে. Media replacement/edit এখনো নেই. Private media-এর download URL token-based হওয়ায় সংবেদনশীল মিডিয়ার জন্য proxy delivery প্রয়োজন.
- Creator Analytics-এ Auth registration, posts, stories, reports, DAU/WAU/MAU, returning users (tracking deployment-এর পর থেকে), Planner-এ যোগ করা popular destinations ও tool-open ভিত্তিক popular feature usage-এর ভিত্তি আছে; returning-user tracking deployment-এর পর থেকে শুরু হবে; anonymous visitors ও revenue metrics নেই.
- Private media-এর Firebase download URL bearer link হিসেবে share হলে link যার কাছে যায় সে access পেতে পারে; অত্যন্ত সংবেদনশীল private media-র জন্য authenticated proxy/server delivery দরকার.
- Public holiday, food, emergency, hotel and transport provider coverage varies. Official verification is required.

গুরুত্বপূর্ণ
- কোনো GitHub push বা Firebase deploy করা হয়নি.
- Firebase Auth implementation আগের working source থেকে অপরিবর্তিত রাখা হয়েছে.
- এই ZIP-কে live site-এ deploy করার আগে QA report এবং Firebase deployment checklist পড়ুন.

সর্বশেষ World Food Guide আপডেট (১০ নভেম্বর ২০২৬): National & Traditional Dishes-এর জন্য ব্যবহারকারীর দেওয়া বাংলা উইকিপিডিয়া “জাতীয় খাবার” নিবন্ধকে সরাসরি রেফারেন্স লিংক হিসেবে যুক্ত করা হয়েছে। TheMealDB রেসিপি/ছবির আলাদা উৎস। উইকিপিডিয়ার তালিকা community-edited; এটি সরকারি বা সম্পূর্ণ তালিকা নয়। বিস্তারিত: V23-STAGE-11-WORLD-FOOD-REFERENCE-CHANGE-NOTES-BN.txt।


সর্বশেষ Stage 12 final hardening (১০ নভেম্বর ২০২৬):
- Owner post deletion এখন `deleteOwnPost` authenticated callable ব্যবহার করে; owner যাচাইয়ের পর media এবং nested comments/likes recursive cleanup হয়। Cloud Function deploy না থাকলে client-side unsafe delete fallback করা হয় না।
- Creator Analytics-এর Auth/Post/Story/Report event counters-এ processed-event marker যোগ করা হয়েছে, যাতে Cloud Functions event retry একই event একাধিকবার গণনা না করে।
- Updated static QA report: V23-FINAL-QA-REPORT-BN.txt।
