# Anondo Bangla — Premium Update (Acode / Android)

এই আপডেটটি তোমার বর্তমান ওয়েবসাইটের নাম, ৬৪ জেলার ডেটা, JavaScript এবং localStorage key পরিবর্তন করে না।
এটি মূলত নতুন logo + premium styling + PWA icon + cache update যোগ করে।

## খুব গুরুত্বপূর্ণ — প্রথমে Backup
GitHub Repository থেকে বর্তমান `index.html`, `manifest.json`, `sw.js` আলাদা করে Download/Save করে রাখবে।
কোনো ফাইল Delete করবে না।

## Acode দিয়ে আপডেট
1. ZIP Extract করো।
2. `premium.css`, `brand-logo.svg`, `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` ফাইলগুলো তোমার বর্তমান প্রজেক্টের root folder-এ কপি করো।
3. বর্তমান `index.html` খুলে `<head>` অংশে, `</head>`-এর ঠিক আগে এই লাইনটি যোগ করো:

   `<link rel="icon" type="image/svg+xml" href="favicon.svg">`
   `<link rel="stylesheet" href="premium.css">`

4. `manifest.json` ফাইলটি এই ZIP-এর `manifest.json` দিয়ে Replace করো।
5. `sw.js` ফাইলটি এই ZIP-এর `sw.js` দিয়ে Replace করো।
6. `index.html`-এর বাকি কোনো কোড, জেলা ডেটা বা JavaScript মুছবে/পরিবর্তন করবে না।
7. Acode Preview-তে পরীক্ষা করো। তারপর একই GitHub Repository-তে ফাইলগুলো Upload/Commit করো।

## কী অপরিবর্তিত
- নাম: Anondo Bangla | Explore Bangladesh
- ৬৪ জেলার ডেটা, সার্চ ও বিভাগ ফিল্টার
- ভ্রমণ তালিকা, Profile, ছবি, Points, Badges
- Achievement Card PNG/JPG/Print
- Dark Mode এবং আগের localStorage key

## Offline/PWA
Service Worker HTTPS-এ কাজ করে। GitHub Pages/Render deploy হওয়ার পর ওয়েবসাইট একবার Online-এ খুলে রাখবে, তারপর offline cache তৈরি হবে।
Browser-এর পুরোনো cache থাকলে site reload বা browser cache refresh করতে হতে পারে।

## নোট
`og-image.png`-এর জন্য ZIP-এ পুরোনো ফাইল থাকলে সেটি আগের মতোই রাখবে। এই ZIP-এ সেটি নেই, কারণ আগের Social Preview image-টি অক্ষত রাখা উচিত।
