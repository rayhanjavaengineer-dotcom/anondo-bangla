/* Anondo Bangla — Cover photo controls, v2.9
   Device-local cover image; does not modify Firebase authentication or profile data. */
(function () {
  'use strict';
  const KEY = 'ab_traveler_cover_photo_v1';
  const MAX_FILE_BYTES = 8 * 1024 * 1024;
  const MAX_EDGE = 1800;
  const QUALITY = 0.82;
  const $ = id => document.getElementById(id);
  const read = () => { try { return localStorage.getItem(KEY) || ''; } catch (_) { return ''; } };
  const save = value => {
    try { localStorage.setItem(KEY, value); return true; }
    catch (_) { window.alert('Cover Photo সংরক্ষণ করা যায়নি। ছোট ছবি ব্যবহার করুন বা Browser Storage খালি করুন।'); return false; }
  };
  function menuOpen(open) {
    const menu = $('abCoverMenu'), button = $('abCoverMenuButton');
    if (!menu || !button) return;
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  }
  function sync(data) {
    const img = $('abCoverPreview');
    const upload = $('abCoverUploadAction'), change = $('abCoverChangeAction'), remove = $('abCoverRemoveAction');
    if (!img || !upload || !change || !remove) return;
    if (data) {
      img.src = data; img.hidden = false;
      upload.hidden = true; change.hidden = false; remove.hidden = false;
    } else {
      img.removeAttribute('src'); img.hidden = true;
      upload.hidden = false; change.hidden = true; remove.hidden = true;
    }
  }
  function compress(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('ছবি পড়া যায়নি।'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('ছবির ফরম্যাট পড়া যায়নি।'));
        image.onload = () => {
          const ratio = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
          const context = canvas.getContext('2d');
          if (!context) return reject(new Error('ছবি প্রস্তুত করা যায়নি।'));
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', QUALITY));
        };
        image.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }
  function init() {
    const button = $('abCoverMenuButton'), menu = $('abCoverMenu'), wrap = $('abCoverMenuWrap');
    const input = $('abCoverInput'), upload = $('abCoverUploadAction'), change = $('abCoverChangeAction'), remove = $('abCoverRemoveAction');
    if (![button, menu, wrap, input, upload, change, remove].every(Boolean)) return;
    sync(read());
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); menuOpen(menu.hidden); });
    const choose = () => { menuOpen(false); input.click(); };
    upload.addEventListener('click', choose);
    change.addEventListener('click', choose);
    remove.addEventListener('click', () => {
      menuOpen(false);
      if (!read() || !window.confirm('আপনার Cover Photo সরিয়ে ফেলবেন?')) return;
      try { localStorage.removeItem(KEY); } catch (_) {}
      sync('');
    });
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { window.alert('শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।'); input.value = ''; return; }
      if (file.size > MAX_FILE_BYTES) { window.alert('ছবির সাইজ ৮ MB-এর মধ্যে রাখুন।'); input.value = ''; return; }
      try { const data = await compress(file); if (save(data)) sync(data); }
      catch (error) { window.alert(error && error.message ? error.message : 'Cover Photo আপলোড করা যায়নি।'); }
      finally { input.value = ''; }
    });
    document.addEventListener('click', event => { if (!wrap.contains(event.target)) menuOpen(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') menuOpen(false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
