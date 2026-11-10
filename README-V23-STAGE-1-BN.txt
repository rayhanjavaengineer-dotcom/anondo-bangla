ANONDO BANGLA v23 — Stage 1

প্রকাশের আগে:
1. ZIP extract করুন।
2. GitHub repository-তে আগের v22 files-এর সঙ্গে merge/replace করুন; কোনো পুরোনো user data মুছবেন না।
3. সব changed files commit করুন।
4. GitHub Pages deploy শেষ হলে Android Chrome-এ hard refresh করুন; প্রয়োজনে site data clear না করে শুধু page refresh / নতুন tab ব্যবহার করুন।
5. Header-এর Install এবং Share action, নিচের Explore/Tools/Profile navigation পরীক্ষা করুন।

এই build-এ Firebase config/auth files আগের baseline থেকে হুবহু রাখা হয়েছে। Uploaded v22 archive-এ config placeholders দেখা গিয়েছিল, কিন্তু user-confirmed live deployment-এ login/logout কাজ করছে; তাই live configuration-কে এই ZIP থেকে overwrite বা reset করবেন না।

এই Stage-এ browser/device runtime test করা হয়নি। Native install prompt ব্রাউজার ও PWA eligibility-এর ওপর নির্ভর করে; prompt না এলে button install instructions দেখাবে।
