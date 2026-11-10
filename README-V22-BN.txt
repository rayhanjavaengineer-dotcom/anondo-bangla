Anondo Bangla v22 — Global Explore & Travel Identity Account

এই ZIP v21-এর সব ফাইল ও asset রেখে তৈরি করা হয়েছে। নতুন ফাইল:
- firebase-config.js: নিজের Firebase Web App config বসানোর template
- firebase-auth.js: optional Email/Password ও Google sign-in
- FIREBASE-SETUP-BN.txt: Firebase login চালুর বাংলা নির্দেশনা
- RELEASE-NOTES-V22-BN.txt এবং QA-REPORT-V22-BN.txt

মূল পরিবর্তন:
1. Bottom Explore এখন সম্পূর্ণ Global Explorer workspace খোলে।
2. Home-এর Explore the World বাটনও Bangladesh District Explorer নয়, Global Explorer খোলে।
3. Profile-এ optional Email/Password account, Google sign-in, account create, password reset ও sign-out যোগ হয়েছে।
4. Login না করেও পুরোনো Travel Identity/Profile editor ব্যবহার করা যাবে।

গুরুত্বপূর্ণ:
Firebase config না বসালে online login চালু হবে না। Firebase Console-এ Email/Password ও Google provider enable করে GitHub Pages domain authorize করতে হবে। নির্দেশনা FIREBASE-SETUP-BN.txt-এ আছে।
Travel Identity ও ভ্রমণ রেকর্ড এখনো device-local; cloud sync এই সংস্করণে নেই।

বাস্তব Firebase account sign-in এবং GitHub Pages runtime পরীক্ষা config ছাড়া করা সম্ভব হয়নি।
