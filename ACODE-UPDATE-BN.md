# Anondo Bangla — Ultimate International Edition

## GitHub ও Cloudflare Pages-এ আপডেট

1. ZIP Extract করুন।
2. `rayhanjavaengineer-dotcom/anondo-bangla` Repository-এর Root-এ ZIP-এর সব ফাইল Upload/Replace করুন।
3. `main` Branch-এ Commit changes করুন।
4. Cloudflare Pages Dashboard → আপনার Anondo Bangla Project → Deployments-এ গিয়ে নতুন Deployment `Success` হয়েছে কি না দেখুন।
5. Build command ফাঁকা এবং Build output directory `/` (Root) রাখুন।

## নতুন ও বিদ্যমান সুবিধা

- আগের ৬৪ জেলার Explorer, Division Map, Search/Filter, Visited Tracker, Profile, Theme, Badges ও Achievement Card রাখা হয়েছে।
- Travel Bucket List, Digital Passport, Budget Calculator, District Food Guide ও Photo Gallery।
- Smart Travel Planner, Travel Memory Journal, Festival Calendar, Emergency 999 তথ্য।
- QR Travel Card (ব্যবহারকারীর সম্মতি নিয়ে তৃতীয় পক্ষের QR image service)।
- JSON Data Backup & Restore।
- PWA/Offline cache update এবং mobile responsive refinements।

## ব্যক্তিগত ডেটা

ডেটা Browser-এর localStorage-এ থাকে। এক ডিভাইস থেকে অন্য ডিভাইসে নিতে Backup Download করে নতুন ডিভাইসে Restore করুন। Gallery-তে বেশি ছবি রাখলে Browser Storage পূর্ণ হতে পারে।

## সীমাবদ্ধতা ও সতর্কতা

এটি Static, local-first সংস্করণ। User login, cloud synchronization, community review/upload, live booking, live hotel/transport pricing, live weather ও live distance calculation-এর জন্য পরবর্তী Backend/API integration প্রয়োজন। কোনো live service চালু আছে বলে এখানে দাবি করা হয়নি। ধর্মীয় চন্দ্রভিত্তিক উৎসবের তারিখ প্রতিবছর সরকারি ঘোষণা অনুযায়ী যাচাই করতে হবে।

## Troubleshooting

- পুরোনো PWA cache: সব ট্যাব বন্ধ করে আবার খুলুন; প্রয়োজনে PWA uninstall করে নতুন deployment যাচাইয়ের পর reinstall করুন।
- জেলা না দেখালে: Cloudflare deployment Success হয়েছে কি না দেখুন এবং browser hard refresh করুন।
- Backup Restore করার আগে বর্তমান ডেটার Backup রাখুন।
