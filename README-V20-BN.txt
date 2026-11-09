ANONDO BANGLA v20 — APP SHELL & CORE EXPERIENCE
================================================

v20-তে v19 ZIP-কে baseline হিসেবে রেখে নতুন App Shell যোগ করা হয়েছে।

নতুন আপডেট:
1. স্থায়ী Bottom Navigation: Home, Explore, Tools, Profile.
2. উপরের ডান পাশে Settings/Three-dot menu.
3. বিদ্যমান Light/Dark theme button রাখা হয়েছে; theme persistence আগের ব্যবস্থাতেই।
4. Language selector-এ বাংলা ও English রাখা হয়েছে। Hero/Workspace text ও menu labels এই দুই ভাষায় বদলায়।
   গুরুত্বপূর্ণ: পুরো অ্যাপের প্রতিটি legacy field/response এখনো পূর্ণাঙ্গভাবে translated নয়।
5. Settings: Rate/Feedback, Privacy, Security & Data, Language, App Settings (font size), Help,
   Official Travel Links, Share, About, Terms.
6. Feedback এই ডিভাইসের Local Storage-এ রাখা হয়; Play Store rating link নেই কারণ প্রকাশিত Store URL দেওয়া হয়নি।
7. Privacy/Security পেজে Local Storage, external services এবং backup সংক্রান্ত বাস্তব সীমাবদ্ধতা বলা হয়েছে।
8. Official resource links: IATA Travel Centre, US/Canada/UK/Australia travel advice, Bangladesh tourism ministry
   এবং Bangladesh Immigration Police.
9. নতুন CSS/JS Service Worker v20 core cache-এ যুক্ত।

মূল Navigation:
- Home: মূল Dashboard-এ ফেরে।
- Explore: বিদ্যমান Destination & Hotel Finder tool খোলে।
- Tools: মূল Workspace/Tool Dashboard-এ ফেরে।
- Profile: বিদ্যমান Profile tool খোলে।

গুরুত্বপূর্ণ সীমাবদ্ধতা:
- কোনো Hotel booking/payment app-এর ভেতরে নেই; Hotel discovery এবং official/external links ব্যবহৃত হবে।
- Flight fare, live hotel inventory, traffic ETA, live visa decision ইত্যাদি দাবি করা হয় না। সংশ্লিষ্ট external/official link ব্যবহার করতে হবে।
- এই build-এ real Android/iOS/browser visual test বা live deployment test করা হয়নি।
- Static checks পাস করলেও GitHub deploy-এর পর ফোনে smoke/regression test আবশ্যক।
- v19-এর পুরোনো features, Bangladesh 64-district section, images/icons/assets ও existing data keys রাখা হয়েছে।

Deploy:
ZIP extract করে GitHub repository root-এ সব ফাইল upload/replace করুন। আগের live project backup রাখুন।
10. Flight Search basic module added: origin, destination, dates, passengers; search handoff to Google Flights
    and Skyscanner plus direct airline official websites. Fare/seat/booking is always handled externally.
