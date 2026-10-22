/* Admin forms: upload a new photo straight from a media field (asks for alt text), fill the key. */
import { onPage } from './page.js';
onPage(() => {
  document.querySelectorAll('[data-media-upload]').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0]; if (!file) return;
      const alt = prompt('Describe the photo (alt text):', ''); if (!alt) { input.value = ''; return; }
      const fd = new FormData(); fd.append('file', file); fd.append('alt', alt); fd.append('kind', 'image');
      input.disabled = true;
      try {
        const r = await fetch('/api/upload', { method: 'POST', body: fd }); const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Upload failed');
        const target = input.closest('[data-media-pick]').querySelector('input.input'); target.value = j.key;
        let img = input.closest('[data-media-pick]').querySelector('img'); if (!img) { img = document.createElement('img'); img.width = 160; img.height = 120; img.style.cssText = 'width:160px;height:120px;object-fit:cover;border:1px solid var(--line-strong)'; input.closest('[data-media-pick]').prepend(img); }
        img.src = j.url;
      } catch (e) { alert(e.message); }
      input.disabled = false; input.value = '';
    });
  });
});
