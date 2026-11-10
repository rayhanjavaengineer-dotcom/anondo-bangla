Anondo Bangla v23 — Stage 5 (Creator Analytics Foundation)

এই ধাপে:
- Firebase Cloud Functions v2 analytics backend যুক্ত হয়েছে।
- DAU, unique WAU, unique MAU এবং registration/post/story/report counts-এর server-side aggregation যুক্ত হয়েছে।
- Creator Analytics panel শুধু admin custom claim থাকা অ্যাকাউন্টে দেখা যাবে।
- Admin claim সেট করার script functions/set-admin-claim.js-এ আছে।

Deploy:
1. Firebase CLI install ও login করুন।
2. `firebase use anondo-bangla-87c40`
3. `firebase deploy --only firestore:rules,firestore:indexes,storage,functions`
4. Functions deployment-এর জন্য Blaze billing লাগতে পারে।
5. Protected service account / Application Default Credentials দিয়ে functions directory থেকে `node set-admin-claim.js FIREBASE_AUTH_UID` চালান।
6. Admin account sign out করে আবার sign in করবে।

Security:
- Service-account JSON, private key বা admin credentials কখনো GitHub repository-তে upload করবেন না।
- Firebase deploy না করা পর্যন্ত rules ও functions live project-এ কার্যকর নয়।
- Static checks pass হলেও live Firebase/Emulator tests হয়নি।


V23 GLOBAL TRAVEL TOOLS UPDATE (১০ নভেম্বর ২০২৬)
- District Food Guide-কে World Food Guide করা হয়েছে। TheMealDB public API থেকে cuisine/area অনুযায়ী dish ও image লোড হয়; provider-এর supported cuisine ও dish coverage সীমিত, তাই একে প্রতিটি দেশের সম্পূর্ণ খাবারের catalogue বলা যাবে না। Source: https://www.themealdb.com/docs_api_guide.php
- Bangladesh Festival Calendar-কে World Festival & Holiday Calendar করা হয়েছে। Nager.Date API থেকে country ISO code ও year অনুযায়ী public holiday আনা হয়; এটি সব সাংস্কৃতিক/ধর্মীয় উৎসব বা স্থানীয় অনুষ্ঠান অন্তর্ভুক্ত করে না। চাঁদ-নির্ভর তারিখ স্থানীয় ঘোষণায় বদলাতে পারে। Source: https://github.com/nager/nager.date
- Travel Safety & Emergency-তে দেশ সার্চ করে country-level general emergency number দেখা ও tap-to-call করা যায়। Source dataset 245 country/territory coverage দাবি করে, Wikipedia-ভিত্তিক এবং officially verified নয়; কোনো দেশের record না থাকলে নম্বর বানিয়ে দেখানো হয় না। Official local source দিয়ে যাচাই করতে হবে। Source: https://github.com/fernando-195/emergency-and-helplines-api (data derived from Wikipedia, CC BY-SA 4.0).
- Global Travel Budget Calculator-এ মুদ্রা নির্বাচন ও transport/accommodation/food/other cost হিসাব যোগ হয়েছে। নতুন budget key ab_global_private_budget_v1-এ শুধু local browser/device-এ থাকে; Firestore/Community-তে পাঠানো হয় না। পুরোনো BDT budget থাকলে BDT ধরে migration করা হয়। Manual backup file-এ budget অন্তর্ভুক্ত হতে পারে; backup নিজে নিরাপদে রাখুন।
- Expense Tracker-এও নির্বাচিত currency অনুযায়ী নতুন খরচ সংরক্ষণ হয়; পুরোনো currency-less expenses-কে BDT হিসেবে দেখানো হয়।
- Currency list Frankfurter এবং countries dataset থেকে পাওয়া যায়; calculator নিজে currency conversion করে না—এটি নির্বাচিত currency-তে total হিসাব করে।
- API data internet connection-এর ওপর নির্ভরশীল; holiday/emergency data cache করা হয়, food data online load হয়।
