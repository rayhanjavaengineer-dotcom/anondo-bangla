/* Anondo Bangla — Traveler Cover Photo Manager v2.2
   Uses device-local storage, matching the existing local Travel Identity editor. */
(function(){
  "use strict";
  const KEY="ab_traveler_cover_photo_v1";
  const MAX_FILE=8*1024*1024;
  const $=id=>document.getElementById(id);
  function note(message){const el=$("abSaveNote");if(el)el.textContent=message;}
  function read(){try{return localStorage.getItem(KEY)||"";}catch(e){return "";}}
  function save(value){try{localStorage.setItem(KEY,value);return true;}catch(e){note("কভার ছবি সংরক্ষণ করা যায়নি—ছবিটি ছোট করে আবার চেষ্টা করুন।");return false;}}
  function render(value){const img=$("abCoverPreview"),remove=$("abCoverRemove");if(!img)return;if(value){img.src=value;img.hidden=false;if(remove)remove.hidden=false;}else{img.removeAttribute("src");img.hidden=true;if(remove)remove.hidden=true;}}
  function makeCover(file){return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),image=new Image();
    image.onload=()=>{try{
      const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");
      const maxW=1600,maxH=650,scale=Math.min(1,maxW/image.naturalWidth,maxH/image.naturalHeight);
      const sw=Math.max(1,Math.round(image.naturalWidth*scale)),sh=Math.max(1,Math.round(image.naturalHeight*scale));
      canvas.width=sw;canvas.height=sh;ctx.drawImage(image,0,0,sw,sh);
      let data=canvas.toDataURL("image/jpeg",.82);
      if(data.length>1200000)data=canvas.toDataURL("image/jpeg",.68);
      URL.revokeObjectURL(url);resolve(data);
    }catch(e){URL.revokeObjectURL(url);reject(e);}};
    image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("ছবি পড়া যায়নি"));};image.src=url;
  });}
  function init(){
    const input=$("abCoverInput"),remove=$("abCoverRemove");
    if(!input||!$("abCoverPreview"))return;
    render(read());
    input.addEventListener("change",async()=>{
      const file=input.files&&input.files[0];if(!file)return;
      if(!/^image\/(jpeg|png|webp)$/.test(file.type)){note("JPG, PNG অথবা WebP ছবি নির্বাচন করুন।");input.value="";return;}
      if(file.size>MAX_FILE){note("কভার ছবিটি ৮ MB-এর কম হতে হবে।");input.value="";return;}
      try{const data=await makeCover(file);if(save(data)){render(data);note("✓ কভার ছবি এই ডিভাইসে সংরক্ষিত হয়েছে।");}}
      catch(e){note("কভার ছবি প্রস্তুত করা যায়নি। অন্য ছবি চেষ্টা করুন।");}
      input.value="";
    });
    remove?.addEventListener("click",()=>{try{localStorage.removeItem(KEY);}catch(e){}render("");note("কভার ছবি সরানো হয়েছে। ডিফল্ট ডিজাইন দেখানো হচ্ছে।");});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
