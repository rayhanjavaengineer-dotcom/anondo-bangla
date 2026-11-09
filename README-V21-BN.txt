ANONDO BANGLA — GLOBAL TRAVEL UPDATE v21
========================================

এই আপডেটে Global Explorer-কে মূল Dashboard-এর কেন্দ্র করা হয়েছে।

প্রধান পরিবর্তন
- মূল Dashboard থেকে 64 District, Bangladesh Explorer এবং BD Travel Points সরানো হয়েছে।
- Countries Explored, Unique Places Visited, Global Travel Points এবং Global Explorer Level এখন প্রধান পরিসংখ্যান।
- Global Travel Records থেকে দেশ ও ইউনিক স্থান গণনা হয়। একই দেশ+স্থান একাধিকবার রেকর্ড হলেও Global Points-এ একবারই গণনা হয়।
- Explorer badge, Profile statistics, Achievement Card এবং Print Card বিশ্বভ্রমণ রেকর্ডভিত্তিক করা হয়েছে।
- Digital Travel Passport এখন Global Travel Records থেকে দেশ/স্থানভিত্তিক Stamp দেখায়।
- Bangladesh-এর ৬৪ জেলার Explorer আলাদা Bangladesh District Explorer হিসেবে রাখা হয়েছে। আগের জেলা-তথ্য ও সংরক্ষিত জেলা তালিকা মুছে ফেলা হয়নি।
- Footer থেকে বাংলাদেশ জেলা/রেমিট্যান্স-সংক্রান্ত অপ্রাসঙ্গিক নোট বাদ দিয়ে Global Travel Companion পরিচিতি দেওয়া হয়েছে।
- Language selector Header থেকে সরিয়ে Three-dot Settings menu-র Change language অপশনে রাখা হয়েছে।
- বাংলা ও English UI-এর জন্য bilingual text mapping যোগ করা হয়েছে; ভাষা নির্বাচন localStorage-এ সংরক্ষিত হয়।
- Service Worker cache version v21 করা হয়েছে যাতে নতুন UI update পাওয়া যায়।

গুরুত্বপূর্ণ
- Global Explorer-এর হিসাব ব্যবহারকারীর নিজে যোগ করা Global Travel Records থেকে হয়। GPS দিয়ে স্বয়ংক্রিয় ভ্রমণ যাচাই হয় না।
- Global Travel Points = প্রতিটি unique Country + Place জোড়ার জন্য 10 points।
- Countries Explored = রেকর্ডে থাকা unique country names-এর সংখ্যা।
- Bangladesh District Explorer আলাদা জাতীয় মডিউল; এর 64-district progress Global stats-এ যোগ হয় না।
- User-entered country/place names অপরিবর্তিত রাখা হয়। কিছু স্থাননাম, district description এবং external provider-এর নিজস্ব কনটেন্ট মূল ভাষায় থাকতে পারে।

প্রকাশ
GitHub Pages-এ v21 ZIP-এর সব ফাইল project root-এ upload/replace করুন। index.html, app-shell-v20.js, navigation.js, profile-section.js, travel-tools.js এবং sw.js একই root-এ থাকতে হবে। Commit করার পর সাইটে hard refresh দিন অথবা PWA বন্ধ করে পুনরায় খুলুন।
