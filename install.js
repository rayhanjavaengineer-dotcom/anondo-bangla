/* Anondo Bangla — cross-platform PWA install experience */
(function () {
  "use strict";
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  let deferredPrompt = null;
  let button = null;

  function makeButton() {
    if (document.getElementById("abInstallAppButton")) return;
    const style = document.createElement("style");
    style.textContent = `
      #abInstallAppButton{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:9998;display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.24);border-radius:999px;padding:12px 17px;background:linear-gradient(135deg,#087b53,#064b3b);color:#fff;font:700 14px/1.2 system-ui,-apple-system,sans-serif;box-shadow:0 10px 28px rgba(4,65,43,.28);cursor:pointer;transition:transform .2s,box-shadow .2s}
      #abInstallAppButton:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(4,65,43,.34)}
      #abInstallAppButton:focus-visible{outline:3px solid #e6b64d;outline-offset:3px}
      #abInstallAppButton[hidden]{display:none}
      #abInstallAppButton .ab-install-icon{font-size:18px}
      #abInstallDialog{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(3,18,14,.64);backdrop-filter:blur(5px)}
      #abInstallDialog[hidden]{display:none}
      #abInstallDialog .ab-install-card{width:min(100%,390px);padding:24px;border:1px solid rgba(255,255,255,.18);border-radius:22px;background:#fff;color:#17352a;box-shadow:0 24px 70px rgba(0,0,0,.28);font:15px/1.6 system-ui,-apple-system,sans-serif}
      #abInstallDialog h2{margin:0 34px 8px 0;font-size:21px}
      #abInstallDialog p{margin:8px 0;color:#52645b}
      #abInstallDialog ol{padding-left:22px;margin:12px 0}
      #abInstallDialog li{margin:7px 0}
      #abInstallDialog .ab-install-close{float:right;border:0;background:#edf4ef;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}
      #abInstallDialog .ab-install-ok{width:100%;border:0;border-radius:12px;padding:12px;background:#087b53;color:#fff;font-weight:700;cursor:pointer}
      @media(max-width:480px){#abInstallAppButton{right:12px;bottom:calc(12px + env(safe-area-inset-bottom));padding:11px 15px}}
    `;
    document.head.appendChild(style);
    button = document.createElement("button");
    button.id = "abInstallAppButton";
    button.type = "button";
    button.setAttribute("aria-label", "Install Anondo Bangla app");
    button.innerHTML = '<span class="ab-install-icon" aria-hidden="true">⬇</span><span>Install App</span>';
    document.body.appendChild(button);

    const dialog = document.createElement("div");
    dialog.id = "abInstallDialog";
    dialog.hidden = true;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "abInstallTitle");
    dialog.innerHTML = '<div class="ab-install-card"><button class="ab-install-close" type="button" aria-label="Close">×</button><h2 id="abInstallTitle">Install Anondo Bangla</h2><div class="ab-install-help"></div><button class="ab-install-ok" type="button">ঠিক আছে</button></div>';
    document.body.appendChild(dialog);
    const close = () => { dialog.hidden = true; };
    dialog.querySelector(".ab-install-close").addEventListener("click", close);
    dialog.querySelector(".ab-install-ok").addEventListener("click", close);
    dialog.addEventListener("click", e => { if (e.target === dialog) close(); });
    button.addEventListener("click", installOrExplain);
  }

  function showHelp(title, html) {
    const dialog = document.getElementById("abInstallDialog");
    if (!dialog) return;
    dialog.querySelector("#abInstallTitle").textContent = title;
    dialog.querySelector(".ab-install-help").innerHTML = html;
    dialog.hidden = false;
  }

  async function installOrExplain() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === "accepted" && button) button.hidden = true;
      } catch (_) {}
      deferredPrompt = null;
      return;
    }
    if (isIOS) {
      showHelp("iPhone / iPad-এ ইনস্টল করুন",
        '<p>Safari ব্রাউজারে Anondo Bangla খুলে নিচের ধাপগুলো অনুসরণ করুন:</p><ol><li>নিচের <b>Share</b> আইকনে চাপ দিন (□↑)।</li><li><b>Add to Home Screen</b> নির্বাচন করুন।</li><li><b>Add</b> চাপ দিন।</li></ol><p>এরপর Home Screen থেকে Anondo Bangla অ্যাপ খুলতে পারবেন।</p>');
      return;
    }
    const instructions = '<p>ব্রাউজারের মেনু (⋮ বা ⋯) খুলে <b>Install app</b> অথবা <b>Add to Home Screen</b> নির্বাচন করুন।</p><p>ইনস্টল অপশন না এলে পেজটি রিফ্রেশ করুন এবং HTTPS সংযোগ নিশ্চিত করুন।</p>';
    showHelp("অ্যাপ ইনস্টল করুন", instructions);
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    if (button) button.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    if (button) button.hidden = true;
  });
  window.addEventListener("DOMContentLoaded", () => {
    makeButton();
    if (isStandalone()) button.hidden = true;
  });
})();
