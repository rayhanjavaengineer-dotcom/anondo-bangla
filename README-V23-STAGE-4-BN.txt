Anondo Bangla v23 — Stage 4

এই ধাপে Firebase-ভিত্তিক Social Community-এর মূল client flow যোগ করা হয়েছে।

প্রয়োজনীয় Firebase services:
- Authentication (Email/Password and/or Google)
- Cloud Firestore
- Firebase Storage

Deploy নির্দেশনা:
1. Firebase CLI দিয়ে project anondo-bangla-87c40 নির্বাচন করুন।
2. firestore.rules, firestore.indexes.json এবং storage.rules project root-এ রেখে firebase.json-এ তাদের path configure করুন।
3. Firebase Console-এ Firestore ও Storage provision করা আছে নিশ্চিত করুন।
4. `firebase deploy --only firestore:rules,firestore:indexes,storage` চালান।
5. GitHub Pages domain Authentication > Settings > Authorized domains-এ যুক্ত আছে নিশ্চিত করুন।
6. Deploy শেষে test account দিয়ে Public post, Private post, Story, Like, Comment, Delete ও Report পরীক্ষা করুন।

সতর্কতা: এই ZIP-এর static source checks সফল হলেও Firebase deploy/runtime test করা হয়নি। Follow system, admin analytics backend ও moderation dashboard এখনো পরবর্তী ধাপ।
