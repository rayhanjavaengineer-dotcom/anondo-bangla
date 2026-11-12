/* Optional Firebase Authentication: Email/Password + Google sign-in.
   Travel Identity remains usable locally if Firebase has not been configured. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const cfg=window.ANONDO_FIREBASE_CONFIG||{};
  const configured=!!(cfg.apiKey&&cfg.authDomain&&cfg.projectId&&cfg.appId&&!String(cfg.apiKey).includes('YOUR_')&&!String(cfg.projectId).includes('YOUR_')&&!String(cfg.appId).includes('YOUR_'));
  const status=(message,type='info')=>{const el=$('abAuthStatus');if(el){el.textContent=message;el.dataset.state=type;}};
  const setBusy=busy=>['abEmailSignIn','abEmailCreate','abGoogleSignIn','abPasswordReset','abAuthSignOut'].forEach(id=>{const b=$(id);if(b)b.disabled=busy;});
  let authCardHomeMarker=null;
  function moveAuthCard(isSignedIn){
    const card=$('abAuthCard'),section=$('profileSection');
    if(!card||!section)return;
    if(!authCardHomeMarker){authCardHomeMarker=document.createComment(' Anondo Bangla account card home position ');card.parentNode.insertBefore(authCardHomeMarker,card);}
    if(isSignedIn){
      // Keep the signed-in account controls at the very end of Travel Identity.
      if(card.parentNode!==section||card!==section.lastElementChild)section.appendChild(card);
    }else if(authCardHomeMarker.parentNode&&card.previousSibling!==authCardHomeMarker){
      authCardHomeMarker.parentNode.insertBefore(card,authCardHomeMarker.nextSibling);
    }
  }
  function renderUser(user){const out=$('abAuthSignedOut'),inside=$('abAuthSignedIn');if(!out||!inside)return;out.hidden=!!user;inside.hidden=!user;moveAuthCard(!!user);if(user){$('abAuthUserName').textContent=user.displayName||'Anondo Bangla Traveler';$('abAuthUserEmail').textContent=user.email||'';$('abAuthProvider').textContent=(user.providerData||[]).map(p=>p.providerId==='google.com'?'Google Account':p.providerId==='password'?'Email Account':p.providerId).join(' · ');$('abAuthAvatar').textContent=(user.displayName||user.email||'T').trim().charAt(0).toUpperCase();if(!$('nameInput').value.trim()&&user.displayName){$('nameInput').value=user.displayName;$('nameInput').dispatchEvent(new Event('input',{bubbles:true}));}}}
  function init(){
    const signIn=$('abEmailSignIn');if(!signIn)return;
    // Save the original location before Firebase restores the previous session.
    const authCard=$('abAuthCard');if(authCard&&!authCardHomeMarker){authCardHomeMarker=document.createComment(' Anondo Bangla account card home position ');authCard.parentNode.insertBefore(authCardHomeMarker,authCard);}
    if(!configured||!window.firebase||!firebase.initializeApp||!firebase.auth){
      ['abEmailSignIn','abEmailCreate','abGoogleSignIn','abPasswordReset'].forEach(id=>{if($(id))$(id).disabled=true;});
      status('Online sign-in চালু করতে Firebase Project Config বসাতে হবে। আপাতত Login ছাড়াই Travel Identity ব্যবহার ও Save করতে পারবেন।','setup');return;
    }
    try{if(!firebase.apps.length)firebase.initializeApp(cfg);}catch(e){status('Firebase configuration যাচাই করুন।','error');return;}
    const auth=firebase.auth();
    auth.onAuthStateChanged(user=>{renderUser(user);status(user?'সফলভাবে সাইন ইন হয়েছে। আপনার Travel Identity এই ডিভাইসে আগের মতোই থাকবে।':'আপনি এখনো সাইন ইন করেননি। চাইলে Google অথবা Email দিয়ে সাইন ইন করুন।',user?'success':'info');});
    const credentials=()=>({email:$('abAuthEmail').value.trim(),password:$('abAuthPassword').value});
    $('abEmailSignIn').addEventListener('click',async()=>{const c=credentials();if(!c.email||!c.password)return status('Email ও Password লিখুন।','error');setBusy(true);try{await auth.signInWithEmailAndPassword(c.email,c.password);}catch(e){status(friendly(e),'error');}finally{setBusy(false);}});
    $('abEmailCreate').addEventListener('click',async()=>{const c=credentials();if(!c.email||c.password.length<6)return status('সঠিক Email এবং কমপক্ষে ৬ অক্ষরের Password দিন।','error');setBusy(true);try{const result=await auth.createUserWithEmailAndPassword(c.email,c.password);try{await result.user.sendEmailVerification();status('অ্যাকাউন্ট তৈরি হয়েছে। Email inbox থেকে verification সম্পন্ন করুন।','success');}catch(_){status('অ্যাকাউন্ট তৈরি হয়েছে। Email verification পরে করতে পারবেন।','success');}}catch(e){status(friendly(e),'error');}finally{setBusy(false);}});
    $('abGoogleSignIn').addEventListener('click',async()=>{setBusy(true);try{const provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await auth.signInWithPopup(provider);}catch(e){if(e.code==='auth/popup-blocked'||e.code==='auth/popup-closed-by-user'){try{await auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());}catch(err){status(friendly(err),'error');}}else status(friendly(e),'error');}finally{setBusy(false);}});
    $('abPasswordReset').addEventListener('click',async()=>{const email=$('abAuthEmail').value.trim();if(!email)return status('Password reset link পেতে আগে Email address লিখুন।','error');setBusy(true);try{await auth.sendPasswordResetEmail(email);status('Password reset link আপনার Email-এ পাঠানো হয়েছে।','success');}catch(e){status(friendly(e),'error');}finally{setBusy(false);}});
    $('abAuthSignOut').addEventListener('click',async()=>{setBusy(true);try{await auth.signOut();}catch(e){status(friendly(e),'error');}finally{setBusy(false);}});
    auth.getRedirectResult().catch(e=>status(friendly(e),'error'));
  }
  function friendly(e){const map={'auth/invalid-email':'Email address সঠিক নয়।','auth/user-not-found':'এই Email দিয়ে কোনো account পাওয়া যায়নি।','auth/wrong-password':'Password সঠিক নয়।','auth/invalid-credential':'Email অথবা Password সঠিক নয়।','auth/email-already-in-use':'এই Email দিয়ে account আগে থেকেই আছে।','auth/weak-password':'আরও শক্তিশালী Password দিন (কমপক্ষে ৬ অক্ষর)।','auth/too-many-requests':'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।','auth/unauthorized-domain':'Firebase Console-এ GitHub Pages domain অনুমোদন করুন।','auth/operation-not-allowed':'Firebase Console-এ Email/Password বা Google provider চালু করুন।','auth/network-request-failed':'ইন্টারনেট সংযোগ পরীক্ষা করুন।'};return map[e&&e.code]||'সাইন ইন করা যায়নি। Firebase Authentication settings ও ইন্টারনেট পরীক্ষা করুন।';}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
