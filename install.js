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
    button = document.getElementById("abInstallAppButton");
    if (!button) return;
    button.type = "button";
    button.setAttribute("aria-label", "Install Anondo Bangla app");
    button.title = "Install Anondo Bangla";

    const style = document.createElement("style");
    style.textContent = `
      #abInstallAppButton{border:1px solid rgba(8,123,83,.25);background:linear-gradient(135deg,#087b53,#064b3b);color:#fff;font-weight:800}
      #abInstallAppButton[hidden]{display:none!important}
      #abInstallDialog{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(3,18,14,.64);backdrop-filter:blur(5px)}
      #abInstallDialog[hidden]{display:none}
      #abInstallDialog .ab-install-card{width:min(100%,390px);padding:24px;border:1px solid rgba(255,255,255,.18);border-radius:22px;background:#fff;color:#17352a;box-shadow:0 24px 70px rgba(0,0,0,.28);font:15px/1.6 system-ui,-apple-system,sans-serif}
      #abInstallDialog h2{margin:0 34px 8px 0;font-size:21px}
      #abInstallDialog p{margin:8px 0;color:#52645b}
      #abInstallDialog ol{padding-left:22px;margin:12px 0}
      #abInstallDialog li{margin:7px 0}
      #abInstallDialog .ab-install-close{float:right;border:0;background:#edf4ef;border-radius:50%;width:34px;height:34px;font-size:20px;cursor:pointer}
      #abInstallDialog .ab-install-ok{width:100%;border:0;border-radius:12px;padding:12px;background:#087b53;color:#fff;font-weight:700;cursor:pointer}
      @media(max-width:560px){.header-action-btn{padding:7px 9px;font-size:11px;min-height:35px}}
    `;
    document.head.appendChild(style);

    let dialog = document.getElementById("abInstallDialog");
    if (!dialog) {
      dialog = document.createElement("div");
      dialog.id = "abInstallDialog";
      dialog.hidden = true;
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "abInstallTitle");
      dialog.innerHTML = '<div class="ab-install-card"><button class="ab-install-close" type="button" aria-label="Close">×</button><h2 id="abInstallTitle">Install Anondo Bangla</h2><div class="ab-install-help"></div><button class="ab-install-ok" type="button">ঠিক আছে</button></div>';
      document.body.appendChild(dialog);
    }
    const close = () => { dialog.hidden = true; };
    dialog.querySelector(".ab-install-close").addEventListener("click", close);
    dialog.querySelector(".ab-install-ok").addEventListener("click", close);
    dialog.addEventListener("click", e => { if (e.target === dialog) close(); });
    button.addEventListener("click", installOrExplain);
    if (deferredPrompt) button.hidden = false;
    if (isStandalone()) {
      button.hidden = true;
      button.textContent = "✓ Installed";
      button.setAttribute("aria-label", "Anondo Bangla is installed");
    }
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
        if (choice && choice.outcome === "accepted" && button) {
          button.hidden = true;
          button.textContent = "✓ Installed";
        }
      } catch (_) {}
      deferredPrompt = null;
      return;
    }
    if (isIOS) {
      showHelp("iPhone / iPad-এ ইনস্টল করুন",
        '<p>Safari ব্রাউজারে Anondo Bangla খুলে নিচের ধাপগুলো অনুসরণ করুন:</p><ol><li>নিচের <b>Share</b> আইকনে চাপ দিন (□↑)।</li><li><b>Add to Home Screen</b> নির্বাচন করুন।</li><li><b>Add</b> চাপ দিন।</li></ol><p>এরপর Home Screen থেকে Anondo Bangla অ্যাপ খুলতে পারবেন।</p>');
      return;
    }
    showHelp("অ্যাপ ইনস্টল করুন",
      '<p>ব্রাউজারের মেনু (⋮ বা ⋯) খুলে <b>Install app</b> অথবা <b>Add to Home Screen</b> নির্বাচন করুন।</p><p>ইনস্টল অপশন না এলে পেজটি রিফ্রেশ করুন এবং HTTPS সংযোগ নিশ্চিত করুন।</p>');
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
    if (button) button.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    if (button) {
      button.hidden = true;
      button.textContent = "✓ Installed";
    }
  });
  window.addEventListener("DOMContentLoaded", makeButton);
})();