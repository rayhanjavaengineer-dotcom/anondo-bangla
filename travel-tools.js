/* ANONDO BANGLA — PREMIUM UPDATE v4
   Add-on module: wishlist, digital passport, budget calculator,
   district food guide and local travel photo gallery.
   Requires the existing index.html globals: districts, visited,
   openDistrictDetails(), escapeHTML(), setStatus().
*/
(function () {
  "use strict";

  const KEYS = {
    wishlist: "ab_v4_wishlist",
    budget: "ab_v4_budget",
    gallery: "ab_v4_gallery"
  };

  let wishlist = [];
  let gallery = [];

  const $ = function (id) { return document.getElementById(id); };
  const money = function (value) {
    return "৳ " + Math.max(0, Number(value) || 0).toLocaleString("en-BD");
  };

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      setStatus("Browser storage পূর্ণ। কিছু ছবি মুছে আবার চেষ্টা করুন।");
      return false;
    }
  }

  function districtName(id) {
    const district = districts.find(function (item) { return item.id === id; });
    return district ? district.bn : "অজানা জেলা";
  }

  function fillDistrictSelects() {
    ["wishlistDistrict", "photoDistrict"].forEach(function (id) {
      const select = $(id);
      districts.forEach(function (district) {
        const option = document.createElement("option");
        option.value = district.id;
        option.textContent = district.bn + " — " + district.division;
        select.appendChild(option);
      });
    });
  }

  function renderWishlist() {
    const host = $("wishlistList");
    if (!wishlist.length) {
      host.innerHTML = '<p class="tool-empty">আপনার Wishlist এখনো খালি। পছন্দের জেলা যোগ করুন।</p>';
      return;
    }

    host.innerHTML = wishlist.map(function (id) {
      const district = districts.find(function (item) { return item.id === id; });
      if (!district) return "";
      const isVisited = visited.has(id);
      return '<div class="wishlist-item"><span><strong>' +
        escapeHTML(district.bn) + '</strong><small>' +
        escapeHTML(district.division) + ' বিভাগ' +
        (isVisited ? ' · ✓ ঘোরা হয়েছে' : '') +
        '</small></span><div class="wishlist-actions">' +
        '<button type="button" data-wish-open="' + id + '">বিস্তারিত</button>' +
        '<button type="button" data-wish-remove="' + id + '" aria-label="তালিকা থেকে সরান">×</button>' +
        '</div></div>';
    }).join("");

    host.querySelectorAll("[data-wish-remove]").forEach(function (button) {
      button.addEventListener("click", function () {
        wishlist = wishlist.filter(function (id) { return id !== button.dataset.wishRemove; });
        if (write(KEYS.wishlist, wishlist)) renderWishlist();
      });
    });

    host.querySelectorAll("[data-wish-open]").forEach(function (button) {
      button.addEventListener("click", function () {
        openDistrictDetails(button.dataset.wishOpen);
      });
    });
  }

  function renderPassport() {
    const host = $("passportStamps");
    $("passportCount").textContent = visited.size + " / 64";
    const completed = districts.filter(function (district) {
      return visited.has(district.id);
    });

    host.innerHTML = completed.length ? completed.map(function (district) {
      return '<div class="passport-stamp" title="' + escapeHTML(district.bn) +
        '"><span>🇧🇩</span><strong>' + escapeHTML(district.bn) +
        '</strong><small>VISITED</small></div>';
    }).join("") : '<p class="tool-empty">প্রথম জেলা ভ্রমণ সম্পন্ন হলে আপনার Passport-এ Stamp দেখা যাবে।</p>';
  }

  function renderBudget() {
    const ids = ["budgetTransport", "budgetStay", "budgetFood", "budgetOther"];
    const values = ids.map(function (id) {
      return Math.max(0, Number($(id).value) || 0);
    });
    $("budgetTotal").textContent = money(values.reduce(function (sum, value) {
      return sum + value;
    }, 0));

    const saved = {};
    ids.forEach(function (id) { saved[id] = $(id).value; });
    write(KEYS.budget, saved);
  }

  function renderFood() {
    const query = $("foodSearch").value.trim().toLowerCase();
    const results = districts.filter(function (district) {
      return (district.bn + " " + district.en + " " + district.division + " " + district.food)
        .toLowerCase().includes(query);
    });

    $("foodResults").innerHTML = results.map(function (district) {
      return '<button class="food-row" type="button" data-food-id="' + district.id +
        '"><span class="food-emoji">🍽️</span><span><strong>' +
        escapeHTML(district.bn) + '</strong><small>' +
        escapeHTML(district.division) + ' বিভাগ</small><em>' +
        escapeHTML(district.food) + '</em></span><span class="food-arrow">›</span></button>';
    }).join("") || '<p class="tool-empty">কোনো ফলাফল পাওয়া যায়নি।</p>';

    $("foodResults").querySelectorAll("[data-food-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        openDistrictDetails(button.dataset.foodId);
      });
    });
  }

  function renderGallery() {
    const host = $("travelGallery");
    if (!gallery.length) {
      host.innerHTML = '<p class="tool-empty">এখনো কোনো ছবি সংরক্ষণ করা হয়নি। আপনার ভ্রমণের প্রথম ছবিটি যোগ করুন।</p>';
      return;
    }

    host.innerHTML = gallery.map(function (item, index) {
      return '<figure class="gallery-item"><img src="' + item.data + '" alt="' +
        escapeHTML(item.name) + '"><figcaption><strong>' +
        escapeHTML(item.name) + '</strong><button type="button" data-photo-remove="' +
        index + '">মুছুন</button></figcaption></figure>';
    }).join("");

    host.querySelectorAll("[data-photo-remove]").forEach(function (button) {
      button.addEventListener("click", function () {
        gallery.splice(Number(button.dataset.photoRemove), 1);
        if (write(KEYS.gallery, gallery)) renderGallery();
      });
    });
  }

  function compressImage(file) {
    return new Promise(function (resolve) {
      const reader = new FileReader();
      reader.onload = function () {
        const image = new Image();
        image.onload = function () {
          const scale = Math.min(1, 720 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          if (!context) { resolve(""); return; }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.68));
        };
        image.onerror = function () { resolve(""); };
        image.src = String(reader.result);
      };
      reader.onerror = function () { resolve(""); };
      reader.readAsDataURL(file);
    });
  }

  function initTools() {
    fillDistrictSelects();

    wishlist = read(KEYS.wishlist, []).filter(function (id) {
      return districts.some(function (district) { return district.id === id; });
    });

    gallery = read(KEYS.gallery, []).filter(function (item) {
      return item && typeof item.data === "string" && typeof item.id === "string";
    });

    const budget = read(KEYS.budget, {});
    ["budgetTransport", "budgetStay", "budgetFood", "budgetOther"].forEach(function (id) {
      $(id).value = budget[id] || "";
    });

    renderWishlist();
    renderPassport();
    renderBudget();
    renderFood();
    renderGallery();

    $("addWishlistButton").addEventListener("click", function () {
      const id = $("wishlistDistrict").value;
      if (!id) { setStatus("আগে একটি জেলা নির্বাচন করুন"); return; }
      if (wishlist.includes(id)) { setStatus("জেলাটি আগে থেকেই Wishlist-এ আছে"); return; }
      wishlist.push(id);
      if (write(KEYS.wishlist, wishlist)) {
        $("wishlistDistrict").value = "";
        renderWishlist();
        setStatus("Wishlist-এ যোগ হয়েছে ✓");
      }
    });

    ["budgetTransport", "budgetStay", "budgetFood", "budgetOther"].forEach(function (id) {
      $(id).addEventListener("input", renderBudget);
    });

    $("resetBudgetButton").addEventListener("click", function () {
      ["budgetTransport", "budgetStay", "budgetFood", "budgetOther"].forEach(function (id) {
        $(id).value = "";
      });
      renderBudget();
      setStatus("খরচের হিসাব মুছে ফেলা হয়েছে");
    });

    $("foodSearch").addEventListener("input", renderFood);

    $("saveTravelPhotoButton").addEventListener("click", async function () {
      const id = $("photoDistrict").value;
      const input = $("travelPhotoInput");
      const file = input.files && input.files[0];

      if (!id || !file) { setStatus("জেলা ও একটি ছবি নির্বাচন করুন"); return; }
      if (!file.type.startsWith("image/")) { setStatus("শুধু ছবির ফাইল নির্বাচন করুন"); return; }
      if (file.size > 8 * 1024 * 1024) { setStatus("ছবিটি 8MB-এর কম হতে হবে"); return; }

      const data = await compressImage(file);
      if (!data) { setStatus("ছবি পড়া যায়নি"); return; }

      gallery.unshift({ id: id, name: districtName(id), data: data });
      if (write(KEYS.gallery, gallery)) {
        renderGallery();
        input.value = "";
        $("photoDistrict").value = "";
        setStatus("ভ্রমণের ছবি সংরক্ষিত হয়েছে ✓");
      }
    });
  }

  // Keep the passport and wishlist status synchronized with the original tracker.
  function hookOriginalFunctions() {
    if (typeof window.toggleVisited === "function" && !window.toggleVisited.__v4Wrapped) {
      const originalToggle = window.toggleVisited;
      const wrappedToggle = function () {
        const result = originalToggle.apply(this, arguments);
        renderPassport();
        renderWishlist();
        return result;
      };
      wrappedToggle.__v4Wrapped = true;
      window.toggleVisited = wrappedToggle;
    }
    if (typeof window.resetData === "function" && !window.resetData.__v4Wrapped) {
      const originalReset = window.resetData;
      const wrappedReset = function () {
        const result = originalReset.apply(this, arguments);
        renderPassport();
        renderWishlist();
        return result;
      };
      wrappedReset.__v4Wrapped = true;
      window.resetData = wrappedReset;
    }
  }

  hookOriginalFunctions();
  window.addEventListener("DOMContentLoaded", function () {
    initTools();
    hookOriginalFunctions();
  });
})();
