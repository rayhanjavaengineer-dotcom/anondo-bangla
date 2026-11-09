/* Anondo Bangla — Profile enhancement. Load after the existing inline app script. */
(function(){
  "use strict";
  const KEY_TITLE="ab_profile_title_v1", KEY_FAVORITE="ab_profile_favorite_v1", KEY_MOTTO="ab_profile_motto_v1";
  const $=id=>document.getElementById(id);
  const safe=(key,value)=>{try{localStorage.setItem(key,value);}catch(e){}};
  const read=(key,fallback="")=>{try{return localStorage.getItem(key)||fallback;}catch(e){return fallback;}};
  function metrics(){
    const visited=Number(($("visitedStat")?.textContent||"0").replace(/[^\d]/g,""))||0;
    const points=Number(($("pointsStat")?.textContent||"0").replace(/[^\d]/g,""))||visited*10;
    const percent=Math.min(100,Math.round(visited/64*100));
    const badges=[0,5,10,20,32,50,64].filter(n=>visited>=n).length;
    let level=visited>=50?"Legend":visited>=32?"Master Explorer":visited>=20?"Explorer III":visited>=10?"Explorer II":visited>=5?"Explorer I":"New Explorer";
    return {visited,points,percent,badges,level,xp:visited*10};
  }
  function refresh(){
    const name=$("nameInput")?.value.trim()||read("anondoBanglaNameV4","")||"Your Name";
    const title=$("abTravelTitle")?.value.trim()||read(KEY_TITLE,"Global Traveler");
    const favorite=$("abFavoritePlace")?.value.trim()||read(KEY_FAVORITE,"আপনার পরবর্তী গন্তব্য");
    const motto=$("abMotto")?.value.trim()||read(KEY_MOTTO,"Explore the world, collect memories");
    const m=metrics();
    $("abDisplayName").textContent=name;
    $("abDisplayTitle").textContent=title+" • Travel Lover";
    $("abDisplayMotto").innerHTML="“"+motto.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))+"” <span>♥</span>";
    $("abFavoritePreview").textContent=favorite;
    $("abVisitedCount").textContent=m.visited;
    $("abPointsCount").textContent=m.points.toLocaleString("en-US");
    $("abBadgeCount").textContent=m.badges;
    $("abPercentCount").textContent=m.percent+"%";
    $("abPanelVisited").textContent=m.visited+" / 64";
    $("abPanelPoints").textContent=m.points.toLocaleString("en-US");
    $("abPanelBadge").textContent=m.level;
    $("abLevelName").textContent=m.level;
    $("abXpLabel").textContent=m.xp+" / 640 XP";
    $("abXpBar").style.width=m.percent+"%";
    $("abPanelBar").style.width=m.percent+"%";
    $("abNextLevel").textContent=m.visited>=64?"বাংলাদেশের ৬৪ জেলা সম্পন্ন!":(64-m.visited)+"টি জেলা বাকি — আপনার যাত্রা চালিয়ে যান।";
    $("abTravelId").textContent="AB-"+(Math.abs(hashCode(read("anondoBanglaNameV4","traveler"))).toString(36).toUpperCase().padStart(5,"0").slice(0,6));
    const img=$("profilePreview"), fallback=$("abAvatarFallback");
    if(img && img.getAttribute("src")){fallback.style.display="none";}else{fallback.style.display="grid";}
  }
  function hashCode(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h)+s.charCodeAt(i)|0;return h;}
  function init(){
    if(!$("abTravelTitle"))return;
    $("abTravelTitle").value=read(KEY_TITLE,"Global Traveler");
    $("abFavoritePlace").value=read(KEY_FAVORITE,"");
    $("abMotto").value=read(KEY_MOTTO,"Explore the world, collect memories");
    ["nameInput","abTravelTitle","abFavoritePlace","abMotto"].forEach(id=>$(id)?.addEventListener("input",refresh));
    $("saveProfileButton")?.addEventListener("click",function(){
      safe(KEY_TITLE,$("abTravelTitle").value.trim()||"Global Traveler");
      safe(KEY_FAVORITE,$("abFavoritePlace").value.trim());
      safe(KEY_MOTTO,$("abMotto").value.trim()||"Explore the world, collect memories");
      refresh();
      $("abSaveNote").textContent="✓ আপনার Travel Identity সংরক্ষিত হয়েছে।";
    });
    $("photoInput")?.addEventListener("change",()=>setTimeout(refresh,350));
    $("abRemovePhoto")?.addEventListener("click",function(){
      try{localStorage.removeItem("anondoBanglaPhotoV4");}catch(e){}
      profilePhoto="";
      const img=$("profilePreview");if(img){img.removeAttribute("src");}
      if($("photoInput"))$("photoInput").value="";
      refresh();
      $("abSaveNote").textContent="প্রোফাইল ছবি সরানো হয়েছে। Save Profile চাপলে পরিবর্তনটি নিশ্চিত হবে।";
    });
    $("abShareProfile")?.addEventListener("click",async function(){
      const m=metrics(),name=$("nameInput")?.value.trim()||"An Anondo Bangla traveler";
      const text=name+" — "+m.visited+"/64 districts explored on Anondo Bangla. 🇧🇩";
      try{if(navigator.share)await navigator.share({title:"Anondo Bangla Traveler",text,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text+" "+location.href);$("abSaveNote").textContent="Profile share text copied.";}else $("abSaveNote").textContent=text;}catch(e){}
    });
    refresh();
    const observer=new MutationObserver(refresh);
    ["visitedStat","pointsStat","percentStat"].forEach(id=>{const el=$(id);if(el)observer.observe(el,{childList:true,characterData:true,subtree:true});});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();